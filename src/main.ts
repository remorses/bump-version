import * as core from '@actions/core'
import * as github from '@actions/github'

async function run() {
    const versionPath = core.getInput('version_file',)
    const token = core.getInput('token', {required: true})
    const prefix = core.getInput('prefix',)
    const client = new github.GitHub(token)
    client.git.createTag()
    
}

run()
