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
function run() {
    return __awaiter(this, void 0, void 0, function* () {
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
            'develop';
        // const version_file = './versions.properties'
        const versionPath = core.getInput('version_file') || 'VERSION';
        console.log(versionPath);
        if (!fs.existsSync(versionPath)) {
            fs.writeFileSync(versionPath, '0.0.0', 'utf8');
        }
        const prefix = (core.getInput('prefix') || '').trim();
        const version = fs.readFileSync(versionPath, 'utf8').toString().trim();
        const preReleaseTag = core.getInput('prerelease_tag') || '';
        const split = version.split('=');
        split[1] = core.getInput('version_number');
        const newVersion = split[0] + '=' + split[1];
        // inc(
        //     version,
        //     preReleaseTag ? 'prerelease' : 'patch',
        //     preReleaseTag ?? undefined,
        // )
        if (!newVersion) {
            throw new Error('could not bump version ' + version);
        }
        console.log('listing files in ' + process.cwd());
        fs.readdirSync(process.cwd()).forEach(file => {
            console.log(file);
        });
        console.log('listing files in /home/runner/work/oneapp-android');
        fs.readdirSync('/home/runner/work/oneapp-android').forEach(file => {
            console.log(file);
        });
        console.log(process.cwd());
        console.log('writing new version file');
        console.log('older version ' + version);
        console.log('older new version ' + newVersion);
        fs.writeFileSync(versionPath, newVersion, 'utf8');
        // let linesReplaced: LineReplaced[] = []
        // if (prefix) {
        //     console.log(`replacing version patterns below [bump if ${prefix}]`)
        //     const pattern = new RegExp('\\[bump if ' + prefix + '\\]')
        //     const res = await replacePattern({
        //         pattern,
        //         replacer: versionRegex,
        //         value: newVersion,
        //         ignore,
        //     })
        //     linesReplaced = res.linesReplaced
        // } else {
        //     console.log(`replacing version patterns below [bump]`)
        //     const res = await replacePattern({
        //         pattern: /\[bump\]/,
        //         replacer: versionRegex,
        //         value: newVersion,
        //         ignore,
        //     })
        //     linesReplaced = res.linesReplaced
        // }
        const tagName = "tage name"; //prefix ? prefix + '_' + newVersion : newVersion
        const tagMsg = "tag message"; //${capitalize(prefix) + ' '}Version ${newVersion} [skip ci]`
        yield (0, commit_1.default)({
            USER_EMAIL: 'bump-version@version.com',
            USER_NAME: 'bump_version',
            GITHUB_TOKEN: githubToken,
            MESSAGE: tagMsg,
            tagName,
            tagMsg,
            branch,
        });
        // await createTag({
        //     tagName,
        //     tagMsg,
        // })
        console.log('setting output version=' + newVersion + ' prefix=' + prefix);
        // await createAnnotations({ githubToken, newVersion: tagMsg, linesReplaced })
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
