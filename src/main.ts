import * as core from '@actions/core'
import * as fs from 'fs'
import * as github from '@actions/github'
import {createTag, } from './createTag'
import {capitalize, bump, replacePattern} from './support'

const versionRegex = /[0-9]+\.[0-9]+\.[0-9]+/

async function run() {
    const versionPath = core.getInput('version_file',)
    const prefix = core.getInput('prefix',)
    const version = fs.readFileSync(versionPath, 'utf8').toString().trim()
    const newVersion = bump(version)
    if (prefix) {
        const pattern = new RegExp('\\[bump if ' + prefix + '\\]')
        await replacePattern(pattern, versionRegex, newVersion)
    } else {
        await replacePattern(/.*\[bump\].*/, versionRegex, newVersion)
    }
    await createTag({
        tagName: prefix ? prefix + newVersion : newVersion,
        tagMsg: `${capitalize(prefix)} Version ${newVersion}`
    })
}

run()
