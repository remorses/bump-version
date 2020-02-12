"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (Object.hasOwnProperty.call(mod, k)) result[k] = mod[k];
    result["default"] = mod;
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
const exec_1 = require("@actions/exec");
const core = __importStar(require("@actions/core"));
exports.default = ({ USER_NAME, USER_EMAIL, MESSAGE, GITHUB_TOKEN, tagName, tagMsg }) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        if (!process.env.GITHUB_WORKSPACE || !process.env.GITHUB_REPOSITORY) {
            console.log('using the local execution');
            const options = {
                // cwd: '.',
                errStream: process.stderr,
                outStream: process.stdout
            };
            yield exec_1.exec('git', ['fetch', '--tags'], options);
            yield exec_1.exec('git', ['add', '.'], options);
            try {
                yield exec_1.exec('git', ['commit', '-m', `${MESSAGE}`], options);
            }
            catch (err) {
                console.log('nothing to commit, working tree clean');
                return;
            }
            try {
                yield exec_1.exec('git', ['tag', tagName, '-m', tagMsg], options);
                yield exec_1.exec('git', ['push', 'origin', 'HEAD'], options);
                yield exec_1.exec('git', ['push', 'origin', '--tags'], options);
            }
            catch (e) {
                console.log('got error while tagging and pushing: ' + e);
                return;
            }
            return;
        }
        if (!process.env.GITHUB_TOKEN) {
            console.log('missing required env vars, skipping commit creation');
            core.setFailed('missing required env vars');
            return;
        }
        console.log(`committing changes with message "${MESSAGE}"`);
        const REMOTE_REPO = `https://${process.env.GITHUB_ACTOR}:${GITHUB_TOKEN}@github.com/${process.env.GITHUB_REPOSITORY}.git`;
        const options = {
            cwd: process.env.GITHUB_WORKSPACE,
            listeners: {
                stdline: core.debug,
                stderr: core.error,
                debug: core.debug,
            },
        };
        yield exec_1.exec('git', ['config', 'user.name', `"${USER_NAME}"`], options);
        yield exec_1.exec('git', ['config', 'user.email', `"${USER_EMAIL}"`], options);
        yield exec_1.exec('git', ['remote', 'add', 'publisher', REMOTE_REPO], options);
        yield exec_1.exec('git', ['show-ref'], options);
        yield exec_1.exec('git', ['branch', '--verbose'], options);
        yield exec_1.exec('git', ['add', '-A'], options);
        try {
            yield exec_1.exec('git', ['commit', '-m', `${MESSAGE}`], options);
        }
        catch (err) {
            core.debug('nothing to commit, working tree clean');
            return;
        }
        yield exec_1.exec('git', ['branch', 'tmp'], options);
        yield exec_1.exec('git', ['checkout', 'master'], options);
        yield exec_1.exec('git', ['merge', 'tmp'], options);
        yield exec_1.exec('git', ['push', 'publisher', 'master'], options);
    }
    catch (err) {
        core.setFailed(err.message);
        console.log(err);
    }
});
