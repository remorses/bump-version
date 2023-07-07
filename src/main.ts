import * as core from '@actions/core'
import * as fs from 'fs'
import commit from './commit'
import { createTag } from './createTag'
import {
    capitalize,
    replacePattern,
    LineReplaced,
    versionRegex,
} from './support'
import { inc } from 'semver'

import { createAnnotations } from './createAnnotation'

async function run() {
    const skipCiMessageLocation = (core.getInput('skipCiMessageLocation').trim() || 'subject')
    if (!['subject','trailer'].includes(skipCiMessageLocation)){
        throw new Error(skipCiMessageLocation + ' is not a valid skipCiMessageLocation')
    }
    const githubToken =
        core.getInput('github_token') || process.env.GITHUB_TOKEN
    const ignore =
        core
            .getInput('ignore')
            .split(',')
            .map((x) => x.trim())
            .filter(Boolean) || []
    const GITHUB_REF = process.env.GITHUB_REF || ''
    const branch =
        core.getInput('branch') ||
        process.env.BRANCH ||
        GITHUB_REF.split('/').reverse()[0] ||
        'master'
    const versionPath = core.getInput('version_file') || 'VERSION'
    if (!fs.existsSync(versionPath)) {
        fs.writeFileSync(versionPath, '0.0.0', 'utf8')
    }
    const prefix = (core.getInput('prefix') || '').trim()
    const version = fs.readFileSync(versionPath, 'utf8').toString().trim()
    const preReleaseTag = core.getInput('prerelease_tag') || ''
    const newVersion = inc(
        version,
        preReleaseTag ? 'prerelease' : 'patch',
        preReleaseTag ?? undefined,
    )
    if (!newVersion) {
        throw new Error('could not bump version ' + version)
    }
    console.log('writing new version file')
    fs.writeFileSync(versionPath, newVersion, 'utf8')
    let linesReplaced: LineReplaced[] = []
    if (prefix) {
        console.log(`replacing version patterns below [bump if ${prefix}]`)
        const pattern = new RegExp('\\[bump if ' + prefix + '\\]')
        const res = await replacePattern({
            pattern,
            replacer: versionRegex,
            value: newVersion,
            ignore,
        })
        linesReplaced = res.linesReplaced
    } else {
        console.log(`replacing version patterns below [bump]`)
        const res = await replacePattern({
            pattern: /\[bump\]/,
            replacer: versionRegex,
            value: newVersion,
            ignore,
        })
        linesReplaced = res.linesReplaced
    }
    const tagName = prefix ? prefix + '_' + newVersion : newVersion
    
    const tagMsg = 
        `${capitalize(prefix)} Version ${newVersion}${skipCiMessageLocation == 'trailer' ? '' : ' [skip ci]'}`

    await commit({
        USER_EMAIL: 'bump-version@version.com',
        USER_NAME: 'bump_version',
        GITHUB_TOKEN: githubToken,
        MESSAGE: tagMsg,
        tagName,
        tagMsg,
        branch,
        skipCiMessageLocation,
    })
    await createTag({
        tagName,
        tagMsg,
    })
    console.log('setting output version=' + newVersion + ' prefix=' + prefix)
    await createAnnotations({ githubToken, newVersion: tagMsg, linesReplaced })
    core.setOutput('version', newVersion)
    core.setOutput('prefix', prefix)
    core.info(`new version ${tagMsg}`)
}

try {
    run()
} catch (e) {
    console.error(e)
}
