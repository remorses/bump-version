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
const support_1 = require("./support");
exports.default = ({ USER_NAME, USER_EMAIL, MESSAGE, GITHUB_TOKEN, tagName, tagMsg, branch, }) => __awaiter(void 0, void 0, void 0, function* () {
    try {
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
                stderr: core.debug,
                debug: core.debug,
            },
        };
        yield exec_1.exec('git', ['config', 'user.name', `"${USER_NAME}"`], options);
        yield exec_1.exec('git', ['config', 'user.email', `"${USER_EMAIL}"`], options);
        yield exec_1.exec('git', ['remote', 'add', 'publisher', REMOTE_REPO], options);
        // await exec('git', ['show-ref'], options)
        // await exec('git', ['branch', '--verbose'], options)
        yield exec_1.exec('git', ['add', '-A'], options);
        try {
            yield exec_1.exec('git', ['commit', '-v', '-m', `${MESSAGE}`], options);
        }
        catch (err) {
            core.debug('nothing to commit');
            return;
        }
        yield exec_1.exec('git', ['branch', 'bump_tmp_'], options);
        yield exec_1.exec('git', ['checkout', branch], options);
        yield exec_1.exec('git', ['merge', 'bump_tmp_'], options);
        yield push({ branch, options });
    }
    catch (err) {
        core.setFailed(err.message);
        console.log(err);
        process.exit(1);
    }
});
function push({ branch, options }) {
    return __awaiter(this, void 0, void 0, function* () {
        function fn(bail) {
            return __awaiter(this, void 0, void 0, function* () {
                yield exec_1.exec('git', [
                    'pull',
                    '--no-edit',
                    '--commit',
                    '--strategy-option',
                    'theirs',
                    'publisher',
                    branch,
                ], options);
                yield exec_1.exec('git', ['push', 'publisher', branch], options);
            });
        }
        yield support_1.retry(fn, {
            randomize: true,
            onRetry: (e, i) => {
                console.error(`retrying pushing the ${i} time after error: ${e}`);
            },
            retries: 3,
        });
    });
}
