import * as core from '@actions/core'
import * as github from '@actions/github'
import { ChecksCreateParamsOutputAnnotations } from '@octokit/rest'
import * as fs from 'fs'
import { LineReplaced } from './support'

export async function createAnnotations({
    githubToken,
    newVersion,
    linesReplaced = [] as LineReplaced[],
}) {
    try {
        const octokit = new github.GitHub(githubToken)
        // const now = new Date().toISOString()
        const annotations: ChecksCreateParamsOutputAnnotations[] = linesReplaced.map(
            (x) => {
                return {
                    annotation_level: 'notice',
                    title: `Replaced with ${x.newValue}`,
                    message: `Replaced with ${x.newValue}`,
                    path: x.path.replace('./', ''),
                    start_line: x.line,
                    end_line: x.line,
                }
            },
        )
        const { data } = await octokit.checks.create({
            ...github.context.repo,
            name: github.context.action,
            head_sha: getSha(github.context),
            conclusion: 'success',
            output: {
                title: `Bumped version to ${newVersion}`,
                summary: `Bumped version to ${newVersion}`,
                annotations,
            },
            status: 'completed',
            // started_at: now,
        })
        console.log(data)
    } catch (error) {
        console.log(error)
        // core.error(`${JSON.stringify(error, null, 2)}`)
        return
    }
}

const getSha = (context) => {
    if (context.eventName === 'pull_request') {
        return context.payload.pull_request.head.sha
    } else {
        return context.sha
    }
}
