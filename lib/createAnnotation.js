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
exports.createAnnotations = void 0;
const github = __importStar(require("@actions/github"));
function createAnnotations({ githubToken, newVersion, linesReplaced = [], }) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const octokit = new github.GitHub(githubToken);
            // const now = new Date().toISOString()
            const annotations = linesReplaced.map((x) => {
                return {
                    annotation_level: 'notice',
                    title: `Bumped version to ${x.newValue}`,
                    message: `Bumped version to ${x.newValue}`,
                    path: x.path.replace('./', ''),
                    start_line: x.line,
                    end_line: x.line,
                };
            });
            const { data } = yield octokit.checks.create(Object.assign(Object.assign({}, github.context.repo), { name: 'bump-version', head_sha: getSha(github.context), conclusion: 'success', output: {
                    title: `Bumped version to ${newVersion}`,
                    summary: `Bumped version to ${newVersion}`,
                    annotations,
                }, status: 'completed' }));
            // console.log(data)
        }
        catch (error) {
            console.log(error);
            // core.error(`${JSON.stringify(error, null, 2)}`)
            return;
        }
    });
}
exports.createAnnotations = createAnnotations;
const getSha = (context) => {
    if (context.eventName === 'pull_request') {
        return context.payload.pull_request.head.sha;
    }
    else {
        return context.sha;
    }
};
