import * as fs from 'fs'
import * as path from 'path'
import glob from 'glob'
import globby from 'globby'




const read = async (pattern: RegExp, replacer: RegExp, value: string) => {
    const files = await globby('**', {gitignore: true, expandDirectories: true})
    files.map(name => {
        const lines = fs.readFileSync(name, 'utf8').toString().split('\n')
        const result = lines.reduce((acc, last) => {
            if (acc[acc.length - 1].search(pattern)) {
                console.log('replacing')
                last = last.replace(replacer, value)
            }
            return [...acc, last]
        }, ['']).slice(1).join('\n')
        fs.writeFileSync(name, result, 'utf8')
    })
    // 
}

read(/.*\[bump\].*/, /[0-9]+\.[0-9]+\.[0-9]+/, '0.1.2')

export default read