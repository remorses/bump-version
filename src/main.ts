import * as core from '@actions/core'
import * as github from '@actions/github'
import createTag from './createTag'

async function run() {
    const versionPath = core.getInput('version_file',)
    const prefix = core.getInput('prefix',)
    await createTag({
        tagName: 'xxx',
    })
    
}

run()
