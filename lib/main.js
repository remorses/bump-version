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
function run() {
    return __awaiter(this, void 0, void 0, function* () {
        const skipCiMessageLocation = (core.getInput('skipCiMessageLocation').trim() || 'subject');
        if (!['subject', 'trailer'].includes(skipCiMessageLocation)) {
            throw new Error(skipCiMessageLocation + ' is not a valid skipCiMessageLocation');
        }
        const githubToken = core.getInput('github_token') || process.env.GITHUB_TOKEN;
        const ignore = core
            .getInput('ignore')
            .split(',')
            .map((x) => x.trim())
            .filter(Boolean) || [];
        const GITHUB_REF = process.env.GITHUB_REF || '';
        const branch = core.getInput('branch') ||
            process.env.BRANCH ||
            GITHUB_REF.split('/').reverse()[0] ||
            'master';
        const versionPath = core.getInput('version_file') || 'VERSION';
        if (!fs.existsSync(versionPath)) {
            fs.writeFileSync(versionPath, '0.0.0', 'utf8');
        }
        const prefix = (core.getInput('prefix') || '').trim();
        const version = fs.readFileSync(versionPath, 'utf8').toString().trim();
        const preReleaseTag = core.getInput('prerelease_tag') || '';
        const newVersion = (0, semver_1.inc)(version, preReleaseTag ? 'prerelease' : 'patch', preReleaseTag !== null && preReleaseTag !== void 0 ? preReleaseTag : undefined);
        if (!newVersion) {
            throw new Error('could not bump version ' + version);
        }
        console.log('writing new version file');
        fs.writeFileSync(versionPath, newVersion, 'utf8');
        let linesReplaced = [];
        if (prefix) {
            console.log(`replacing version patterns below [bump if ${prefix}]`);
            const pattern = new RegExp('\\[bump if ' + prefix + '\\]');
            const res = yield (0, support_1.replacePattern)({
                pattern,
                replacer: support_1.versionRegex,
                value: newVersion,
                ignore,
            });
            linesReplaced = res.linesReplaced;
        }
        else {
            console.log(`replacing version patterns below [bump]`);
            const res = yield (0, support_1.replacePattern)({
                pattern: /\[bump\]/,
                replacer: support_1.versionRegex,
                value: newVersion,
                ignore,
            });
            linesReplaced = res.linesReplaced;
        }
        const tagName = prefix ? prefix + '_' + newVersion : newVersion;
        const tagMsg = `${(0, support_1.capitalize)(prefix)} Version ${newVersion}${skipCiMessageLocation == 'trailer' ? '' : ' [skip ci]'}`;
        yield (0, commit_1.default)({
            USER_EMAIL: 'bump-version@version.com',
            USER_NAME: 'bump_version',
            GITHUB_TOKEN: githubToken,
            MESSAGE: tagMsg,
            tagName,
            tagMsg,
            branch,
            skipCiMessageLocation,
        });
        yield (0, createTag_1.createTag)({
            tagName,
            tagMsg,
        });
        console.log('setting output version=' + newVersion + ' prefix=' + prefix);
        yield (0, createAnnotation_1.createAnnotations)({ githubToken, newVersion: tagMsg, linesReplaced });
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
