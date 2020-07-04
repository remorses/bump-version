"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    Object.defineProperty(o, k2, { enumerable: true, get: function() { return m[k]; } });
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
    if (mod != null) for (var k in mod) if (k !== "default" && Object.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const core = __importStar(require("@actions/core"));
const fs = __importStar(require("fs"));
const commit_1 = __importDefault(require("./commit"));
const createTag_1 = require("./createTag");
const support_1 = require("./support");
const semver_1 = require("semver");
const createAnnotation_1 = require("./createAnnotation");
const versionRegex = /[0-9]+\.[0-9]+\.[0-9]+/;
function run() {
    return __awaiter(this, void 0, void 0, function* () {
        const githubToken = core.getInput('github_token') || process.env.GITHUB_TOKEN;
        const GITHUB_REF = process.env.GITHUB_REF || '';
        const branch = core.getInput('branch') ||
            process.env.BRANCH ||
            GITHUB_REF.split('/').reverse()[0] ||
            'master';
        const versionPath = core.getInput('version_file') || 'VERSION';
        const prefix = (core.getInput('prefix') || '').trim();
        const version = fs.readFileSync(versionPath, 'utf8').toString().trim();
        const preReleaseTag = core.getInput('prerelease_tag') || '';
        const newVersion = semver_1.inc(version, preReleaseTag ? 'prepatch' : 'patch', preReleaseTag !== null && preReleaseTag !== void 0 ? preReleaseTag : undefined);
        if (!newVersion) {
            throw new Error('could not bump version ' + version);
        }
        console.log('writing new version file');
        fs.writeFileSync(versionPath, newVersion, 'utf8');
        let linesReplaced = [];
        if (prefix) {
            console.log(`replacing version patterns below [bump if ${prefix}]`);
            const pattern = new RegExp('\\[bump if ' + prefix + '\\]');
            const res = yield support_1.replacePattern(pattern, versionRegex, newVersion);
            linesReplaced = res.linesReplaced;
        }
        else {
            console.log(`replacing version patterns below [bump]`);
            const res = yield support_1.replacePattern(/\[bump\]/, versionRegex, newVersion);
            linesReplaced = res.linesReplaced;
        }
        const tagName = prefix ? prefix + '_' + newVersion : newVersion;
        const tagMsg = `${support_1.capitalize(prefix) + ' '}Version ${newVersion} [skip ci]`;
        yield Promise.all([
            commit_1.default({
                USER_EMAIL: 'bump@version.com',
                USER_NAME: 'bump-version',
                GITHUB_TOKEN: githubToken,
                MESSAGE: tagMsg,
                tagName,
                tagMsg,
                branch,
            }),
            createTag_1.createTag({
                tagName,
                tagMsg,
            }),
        ]);
        console.log('setting output version=' + newVersion + ' prefix=' + prefix);
        yield createAnnotation_1.createAnnotations({ githubToken, newVersion: tagMsg, linesReplaced });
        core.setOutput('version', newVersion);
        core.setOutput('prefix', prefix);
        core.info(`new version ${tagMsg}`);
    });
}
try {
    run();
}
catch (e) {
    console.error(e);
}
