import { exec } from '@actions/exec'
import * as core from '@actions/core'
import { ExecOptions } from '@actions/exec/lib/interfaces'
import { retry } from './support'

export default async ({
    USER_NAME,
    USER_EMAIL,
    MESSAGE,
    GITHUB_TOKEN,
    tagName,
    tagMsg,
    branch,
}) => {
    try {

        if (!process.env.GITHUB_TOKEN) {
            console.log('missing required env vars, skipping commit creation')
            core.setFailed('missing required env vars')
            return
        }
        console.log(`committing changes with message "${MESSAGE}"`)
        const REMOTE_REPO = `https://${process.env.GITHUB_ACTOR}:${GITHUB_TOKEN}@github.com/${process.env.GITHUB_REPOSITORY}.git`

        const options = {
            cwd: process.env.GITHUB_WORKSPACE,
            listeners: {
                stdline: core.debug,
                stderr: core.debug,
                debug: core.debug,
            },
        } as any

        await exec('git', ['config', 'user.name', `"${USER_NAME}"`], options)
        await exec('git', ['config', 'user.email', `"${USER_EMAIL}"`], options)

        await exec('git', ['remote', 'add', 'publisher', REMOTE_REPO], options)
        // await exec('git', ['show-ref'], options)
        // await exec('git', ['branch', '--verbose'], options)

        await exec('git', ['add', '-A'], options)

        try {
            await exec('git', ['commit', '-v', '-m', `${MESSAGE}`], options)
        } catch (err) {
            core.debug('nothing to commit')
            return
        }
        await exec('git', ['branch', 'bump_tmp_'], options)
        await exec('git', ['checkout', branch], options)
        await exec('git', ['merge', 'bump_tmp_'], options)
        await exec('git', ['config', 'pull.rebase', 'false'], options)
        await push({ branch, options })
    } catch (err) {
        core.setFailed(err.message)
        console.log(err)
        process.exit(1)
    }
}

async function push({ branch, options }) {
    async function fn(bail) {
        await exec(
            'git',
            [
                'pull',
                '--no-edit',
                '--commit',
                '--strategy-option',
                'theirs',
                'publisher',
                branch,
            ],
            options,
        )
        await exec('git', ['push', 'publisher', branch], options)
    }
    await retry(fn, {
        randomize: true,
        onRetry: (e, i) => {
            console.error(`retrying pushing the ${i} time after error: ${e}`)
        },
        retries: 3,
    })
}
