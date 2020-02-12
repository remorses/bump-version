import * as core from '@actions/core'
import * as fs from 'fs'
import * as github from '@actions/github'
import { createTag } from './createTag'
import { capitalize, bump, replacePattern } from './support'
import commit from './commit'

const versionRegex = /[0-9]+\.[0-9]+\.[0-9]+/

async function run() {
    console.log('running')
    const versionPath = core.getInput('version_file') || 'VERSION'
    const prefix = (core.getInput('prefix') || '').trim()
    const version = fs
        .readFileSync(versionPath, 'utf8')
        .toString()
        .trim()
    const newVersion = bump(version)
    console.log('wrinting new version file')
    fs.writeFileSync(versionPath, newVersion, 'utf8')
    if (prefix) {
        console.log(`replacing version patterns below [bump if ${prefix}]`)
        const pattern = new RegExp('\\[bump if ' + prefix + '\\]')
        await replacePattern(pattern, versionRegex, newVersion)
    } else {
        console.log(`replacing version patterns below [bump]`)
        await replacePattern(/\[bump\]/, versionRegex, newVersion)
    }
    const tagName = prefix ? prefix + '_' + newVersion : newVersion
    const tagMsg = `${capitalize(prefix) + ' '}Version ${newVersion} [skip ci]`
    await Promise.all([
        commit({
            USER_EMAIL: 'bump@version.com',
            USER_NAME: 'bump-version',
            GITHUB_TOKEN: process.env.GITHUB_TOKEN as string,
            MESSAGE: tagMsg,
            tagName,
            tagMsg,
        }),
        createTag({
            tagName,
            tagMsg,
        }),
    ])
    console.log('setting output version=' + newVersion + ' prefix=' + prefix)
    core.setOutput('version', newVersion)
    core.setOutput('prefix', prefix)
}

try {
    run()
} catch (e) {
    console.error(e)
}
