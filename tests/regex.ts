import { versionRegex } from '../src/support'
import assert from 'assert'

describe('replacePattern', () => {
    const newVersion = 'newVersion'
    it('simple version', () => {
        const res = `export const version = '0.0.0'`.replace(
            versionRegex,
            newVersion,
        )
        console.log(res)
        assert(res === `export const version = '${newVersion}'`)
    })
    it('tagged version', () => {
        const res1 = `export const version = '0.0.0-alpha.0'`.replace(
            versionRegex,
            newVersion,
        )
        console.log(res1)
        assert(res1 === `export const version = '${newVersion}'`)
        const res2 = `export const version = '0.0.0-beta-1'`.replace(
            versionRegex,
            newVersion,
        )
        console.log(res1)
        assert(res2 === `export const version = '${newVersion}'`)
    })
})
