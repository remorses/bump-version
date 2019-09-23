"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
const { exec } = require('@actions/exec');
const core = require('@actions/core');
exports.default = ({ USER_NAME, USER_EMAIL, MESSAGE, GITHUB_TOKEN }) => __awaiter(this, void 0, void 0, function* () {
    try {
        const REMOTE_REPO = `https://${process.env.GITHUB_ACTOR}:${GITHUB_TOKEN}@github.com/${process.env.GITHUB_REPOSITORY}.git`;
        const options = {
            cwd: process.env.GITHUB_WORKSPACE,
            listeners: {
                stdline: core.debug,
                debug: core.debug
            }
        };
        yield exec('git', ['config', 'user.name', `"${USER_NAME}"`], options);
        yield exec('git', ['config', 'user.email', `"${USER_EMAIL}"`], options);
        yield exec('git', ['remote', 'add', 'publisher', REMOTE_REPO], options);
        yield exec('git', ['show-ref'], options);
        yield exec('git', ['branch', '--verbose'], options);
        yield exec('git', ['add', '-A'], options);
        try {
            yield exec('git', ['commit', '-m', `${MESSAGE}`], options);
        }
        catch (err) {
            core.debug('nothing to commit, working tree clean');
            return;
        }
        yield exec('git', ['branch', 'tmp'], options);
        yield exec('git', ['checkout', 'master'], options);
        yield exec('git', ['merge', 'tmp'], options);
        yield exec('git', ['push', 'publisher', 'master'], options);
    }
    catch (err) {
        core.setFailed(err.message);
        console.log(err);
    }
});
