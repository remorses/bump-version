import { promises as fs, lstatSync, Stats } from 'fs'
import globrex from 'globrex'
import globalyzer from 'globalyzer'
import { join, resolve, relative, basename } from 'path'
import uniq from 'lodash.uniq'
const isHidden = /(^|[\\\/])\.[^\\\/\.]/g

let CACHE = {}

async function walk(
    output,
    prefix,
    lexer,
    opts,
    dirname = '',
    level = 0,
    ignore = [],
) {
    const rgx = lexer.segments[level]
    const dir = resolve(opts.cwd, prefix, dirname)
    const files = await fs.readdir(dir)
    const { dot, filesOnly } = opts

    let i = 0,
        len = files.length,
        file
    let fullpath, relpath, stats: Stats, isMatch

    for (; i < len; i++) {
        fullpath = join(dir, (file = files[i]))
        relpath = dirname ? join(dirname, file) : file
        if (!dot && isHidden.test(relpath)) continue
        isMatch = lexer.regex.test(relpath)

        if ((stats = CACHE[relpath]) === void 0) {
            CACHE[relpath] = stats = lstatSync(fullpath)
        }

        if (!stats.isDirectory()) {
            isMatch && output.push(relative(opts.cwd, fullpath))
            continue
        }
        // console.log(basename(relpath))
        if (ignore && ignore.includes(basename(relpath))) {
            continue
        }

        if (rgx && !rgx.test(file)) continue
        !filesOnly && isMatch && output.push(join(prefix, relpath))

        await walk(
            output,
            prefix,
            lexer,
            opts,
            relpath,
            rgx && rgx.toString() !== lexer.globstar && level + 1,
            ignore,
        )
    }
}

export type GlobOptions = {
    cwd?: string
    dot?: boolean
    absolute?: boolean
    filesOnly?: boolean
    flush?: boolean
    gitignore?: boolean
    ignore?: string[]
}

/**
 * Find files using bash-like globbing.
 * All paths are normalized compared to node-glob.
 * @param {String} str Glob string
 * @param {String} [options.cwd='.'] Current working directory
 * @param {Boolean} [options.dot=false] Include dotfile matches
 * @param {Boolean} [options.absolute=false] Return absolute paths
 * @param {Boolean} [options.filesOnly=false] Do not include folders if true
 * @param {Boolean} [options.flush=false] Reset cache object
 * @returns {Array} array containing matching files
 */

export async function glob(str, opts: GlobOptions = {}): Promise<string[]> {
    if (!str) return []

    let glob = globalyzer(str)

    let { ignore = [], gitignore } = opts
    if (gitignore) {
        ignore = [...ignore, ...(await getGlobsFromGit())]
    }
    ignore= uniq(ignore)

    opts.cwd = opts.cwd || '.'

    if (!glob.isGlob) {
        try {
            let resolved = resolve(opts.cwd, str)
            let dirent = await fs.stat(resolved)
            if (opts.filesOnly && !dirent.isFile()) return []

            return opts.absolute ? [resolved] : [str]
        } catch (err) {
            if (err.code != 'ENOENT') throw err

            return []
        }
    }

    if (opts.flush) CACHE = {}

    let matches = []
    const { path } = globrex(glob.glob, {
        filepath: true,
        globstar: true,
        extended: true,
    })

    path.globstar = path.globstar.toString()
    await walk(matches, glob.base, path, opts, '.', 0, ignore)

    return opts.absolute ? matches.map((x) => resolve(opts.cwd, x)) : matches
}

export const getGlobsFromGit = async (data = '') => {
    try {
        data = data || (await fs.readFile('.gitignore', { encoding: 'utf8' }))
        return data
            .split('\n')
            .filter((line) => !/^\s*$/.test(line) && !/^\s*#/.test(line))
            .map((line) => line.trim().replace(/^\/+|\/+$/g, ''))
    } catch (_a) {
        return []
    }
}
