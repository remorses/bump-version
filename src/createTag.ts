import * as core from '@actions/core'
import * as github from '@actions/github'

export async function createTag({ tagName, tagMsg = '' }) {
    if (!process.env.GITHUB_WORKSPACE || !process.env.GITHUB_REPOSITORY) {
        console.log(
            'not in Github Action, skipping tag creation with github api'
        )
        return
    }
    if (!process.env.GITHUB_TOKEN) {
        console.log('missing required env vars, skipping tag creation')
        core.setFailed('missing required env vars')
        return
    }
    console.log(`creating tag "${tagName}"`)
    // Check for existing tag
    const git = new github.GitHub(process.env.GITHUB_TOKEN)
    const owner = process.env.GITHUB_REPOSITORY_OWNER as string
    const repo = process.env.GITHUB_REPOSITORY?.split('/').pop() as string

    const tags = await git.repos.listTags({
        owner,
        repo,
        per_page: 100,
    })

    for (let tag of tags.data) {
        if (tag.name.trim().toLowerCase() === tagName.trim().toLowerCase()) {
            core.debug(`"${tag.name.trim()}" tag already exists.`)
            return
        }
    }

    const newTag = await git.git.createTag({
        owner,
        repo,
        tag: tagName,
        message: tagMsg,
        object: process.env.GITHUB_SHA as string,
        type: 'commit',
    })

    const newReference = await git.git.createRef({
        owner,
        repo,
        ref: `refs/tags/${newTag.data.tag}`,
        sha: newTag.data.sha,
    })

    core.debug(
        `Reference ${newReference.data.ref} available at ${newReference.data.url}`
    )
    return { url: newReference.data.url }
}
