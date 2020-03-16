import { exec }from '@actions/exec'
import * as core from '@actions/core'
import { ExecOptions } from '@actions/exec/lib/interfaces'

export default async ({ USER_NAME, USER_EMAIL, MESSAGE, GITHUB_TOKEN, tagName, tagMsg }) => {
    try {
        if (!process.env.GITHUB_WORKSPACE || !process.env.GITHUB_REPOSITORY) {
            console.log('using the local execution')
            const options: ExecOptions = {
                // cwd: '.',
                errStream: process.stderr,
                outStream: process.stdout
            }
            await exec('git', ['fetch', '--tags'], options)
            await exec('git', ['add', '.'], options)
            try {
                await exec('git', ['commit', '-m', `${MESSAGE}`], options)
            } catch (err) {
                console.log('nothing to commit, working tree clean')
                return
            }
            try {
                await exec('git', ['tag', tagName, '-m', tagMsg], options)
                // await exec('git', ['push', 'origin', 'HEAD'], options)
                // await exec('git', ['push', 'origin', '--tags'], options)
            } catch(e) {
                console.log('got error while tagging and pushing: ' + e)
                return
            }
            return
        }

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
                debug: core.debug ,
            },
        } as any

        await exec('git', ['config', 'user.name', `"${USER_NAME}"`], options)
        await exec('git', ['config', 'user.email', `"${USER_EMAIL}"`], options)

        await exec('git', ['remote', 'add', 'publisher', REMOTE_REPO], options)
        await exec('git', ['show-ref'], options)
        await exec('git', ['branch', '--verbose'], options)

        await exec('git', ['add', '-A'], options)

        try {
            await exec('git', ['commit', '-m', `${MESSAGE}`], options)
        } catch (err) {
            core.debug('nothing to commit, working tree clean')
            return
        }
        const branch = process.env.BRANCH || 'master'
        await exec('git', ['branch', 'tmp'], options)
        await exec('git', ['checkout', branch], options)
        await exec('git', ['merge', 'tmp'], options)
        await exec('git', ['push', 'publisher', branch], options)
    } catch (err) {
        core.setFailed(err.message)
        console.log(err)
    }
}
