import * as fs from 'fs'
import * as path from 'path'
import globby from 'globby'

export interface LineReplaced {
    line: number
    path: string
    newValue: string
}

export const replacePattern = async (
    pattern: RegExp,
    replacer: RegExp,
    value: string,
) => {
    const files = await globby('**', {
        gitignore: true,
        expandDirectories: true,
        onlyFiles: true,
        ignore: ['node_modules'],
    })
    console.log('scanned files')
    const linesReplaced: LineReplaced[] = []
    files.forEach((pathName) => {
        let found = false
        let currentLine = 0
        const lines = fs
            .readFileSync(pathName, 'utf8')
            .toString()
            .split('\n')
        const result = lines
            .reduce(
                (acc, last) => {
                    if (acc[acc.length - 1].search(pattern) !== -1) {
                        found = true
                        linesReplaced.push({
                            line: currentLine,
                            path: pathName,
                            newValue: value
                        })
                        last = last.replace(replacer, value)
                    }
                    currentLine += 1
                    return [...acc, last]
                },
                [''],
            )
            .slice(1)
            .join('\n')
        if (found) {
            fs.writeFileSync(pathName, result, 'utf8')
        }
    })
    return { linesReplaced }
    //
}

export function bump(version: string): string {
    return version.replace(/^([\d\.]+)([\-|\.])(\d+)$/, function() {
        return arguments[1] + arguments[2] + (Number(arguments[3]) + 1)
    })
}

export const capitalize = (prefix) => {
    return prefix.charAt(0).toUpperCase() + prefix.slice(1)
}
// console.log(bump('0.1.0'))

// replacePattern(/.*\[bump\].*/, /[0-9]+\.[0-9]+\.[0-9]+/, '0.1.2')
