"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
const exec_1 = require("@actions/exec");
const core = __importStar(require("@actions/core"));
const support_1 = require("./support");
exports.default = ({ USER_NAME, USER_EMAIL, MESSAGE, GITHUB_TOKEN, tagName, tagMsg, branch, skipCiMessageLocation, }) => __awaiter(void 0, void 0, void 0, function* () {
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
        yield (0, exec_1.exec)('git', ['config', 'user.name', `"${USER_NAME}"`], options);
        yield (0, exec_1.exec)('git', ['config', 'user.email', `"${USER_EMAIL}"`], options);
        yield (0, exec_1.exec)('git', ['remote', 'add', 'publisher', REMOTE_REPO], options);
        // await exec('git', ['show-ref'], options)
        // await exec('git', ['branch', '--verbose'], options)
        yield (0, exec_1.exec)('git', ['add', '-A'], options);
        try {
            const trailerParams = skipCiMessageLocation == 'trailer' ? ['--trailer', 'skip-checks: true'] : [];
            yield (0, exec_1.exec)('git', ['commit', '-v', '-m', `${MESSAGE}`, ...trailerParams], options);
        }
        catch (err) {
            core.debug('nothing to commit');
            return;
        }
        yield (0, exec_1.exec)('git', ['branch', 'bump_tmp_'], options);
        yield (0, exec_1.exec)('git', ['checkout', branch], options);
        yield (0, exec_1.exec)('git', ['merge', 'bump_tmp_'], options);
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
                yield (0, exec_1.exec)('git', 'config pull.rebase false'.split(' '), options);
                yield (0, exec_1.exec)('git', [
                    'pull',
                    '--no-edit',
                    '--commit',
                    '--strategy-option',
                    'theirs',
                    'publisher',
                    branch,
                ], options);
                yield (0, exec_1.exec)('git', ['push', 'publisher', branch], options);
            });
        }
        yield (0, support_1.retry)(fn, {
            randomize: true,
            onRetry: (e, i) => {
                console.error(`retrying pushing the ${i} time after error: ${e}`);
            },
            retries: 3,
        });
    });
}
