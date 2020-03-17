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
