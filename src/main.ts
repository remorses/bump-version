import * as core from '@actions/core'
import * as fs from 'fs'
import * as github from '@actions/github'
import { createTag } from './createTag'
import { capitalize, bump, replacePattern } from './support'
import commit from './commit'

const versionRegex = /[0-9]+\.[0-9]+\.[0-9]+/

async function run() {
    const versionPath = core.getInput('version_file')
    const prefix = core.getInput('prefix').trim()
    const version = fs
        .readFileSync(versionPath, 'utf8')
        .toString()
        .trim()
    const newVersion = bump(version)
    fs.writeFileSync(versionPath, newVersion, 'utf8')
    if (prefix) {
        const pattern = new RegExp('\\[bump if ' + prefix + '\\]')
        await replacePattern(pattern, versionRegex, newVersion)
    } else {
        await replacePattern(/.*\[bump\].*/, versionRegex, newVersion)
    }
    const tagMsg = `${capitalize(prefix) + ' '}Version ${newVersion}`
    await Promise.all([
        commit({
            USER_EMAIL: 'bump@version.com',
            USER_NAME: 'bump-version',
            GITHUB_TOKEN: process.env.GITHUB_TOKEN as string,
            MESSAGE: tagMsg
        }),
        createTag({
            tagName: prefix ? prefix + '_' + newVersion : newVersion,
            tagMsg
        })
    ])
}

run()
