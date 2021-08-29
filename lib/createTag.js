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
exports.createTag = void 0;
const core = __importStar(require("@actions/core"));
const github = __importStar(require("@actions/github"));
function createTag({ tagName, tagMsg = '', gitSha }) {
    var _a;
    return __awaiter(this, void 0, void 0, function* () {
        if (!process.env.GITHUB_WORKSPACE || !process.env.GITHUB_REPOSITORY) {
            console.log('not in Github Action, skipping tag creation with github api');
            return;
        }
        if (!process.env.GITHUB_TOKEN) {
            console.log('missing required env vars, skipping tag creation');
            core.setFailed('missing required env vars');
            return;
        }
        console.log(`creating tag "${tagName}"`);
        // Check for existing tag
        const git = new github.GitHub(process.env.GITHUB_TOKEN);
        const owner = process.env.GITHUB_ACTOR;
        const repo = (_a = process.env.GITHUB_REPOSITORY) === null || _a === void 0 ? void 0 : _a.split('/').pop();
        const tags = yield git.repos.listTags({
            owner,
            repo,
            per_page: 100,
        });
        for (let tag of tags.data) {
            if (tag.name.trim().toLowerCase() === tagName.trim().toLowerCase()) {
                core.debug(`"${tag.name.trim()}" tag already exists.`);
                return;
            }
        }
        const newTag = yield git.git.createTag({
            owner,
            repo,
            tag: tagName,
            message: tagMsg,
            object: gitSha,
            type: 'commit',
        });
        const newReference = yield git.git.createRef({
            owner,
            repo,
            ref: `refs/tags/${newTag.data.tag}`,
            sha: newTag.data.sha,
        });
        core.debug(`Reference ${newReference.data.ref} available at ${newReference.data.url}`);
        return { url: newReference.data.url };
    });
}
exports.createTag = createTag;
