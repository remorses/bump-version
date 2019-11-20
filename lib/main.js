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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const core = __importStar(require("@actions/core"));
const fs = __importStar(require("fs"));
const createTag_1 = require("./createTag");
const support_1 = require("./support");
const commit_1 = __importDefault(require("./commit"));
const versionRegex = /[0-9]+\.[0-9]+\.[0-9]+/;
function run() {
    return __awaiter(this, void 0, void 0, function* () {
        const versionPath = core.getInput('version_file');
        const prefix = core.getInput('prefix').trim();
        const version = fs
            .readFileSync(versionPath, 'utf8')
            .toString()
            .trim();
        const newVersion = support_1.bump(version);
        fs.writeFileSync(versionPath, newVersion, 'utf8');
        if (prefix) {
            const pattern = new RegExp('\\[bump if ' + prefix + '\\]');
            yield support_1.replacePattern(pattern, versionRegex, newVersion);
        }
        else {
            yield support_1.replacePattern(/\[bump\]/, versionRegex, newVersion);
        }
        const tagMsg = `${support_1.capitalize(prefix) + ' '}Version ${newVersion}`;
        yield Promise.all([
            commit_1.default({
                USER_EMAIL: 'bump@version.com',
                USER_NAME: 'bump-version',
                GITHUB_TOKEN: process.env.GITHUB_TOKEN,
                MESSAGE: tagMsg
            }),
            createTag_1.createTag({
                tagName: prefix ? prefix + '_' + newVersion : newVersion,
                tagMsg
            })
        ]);
        core.info('setting output version=' + version + ' prefix=' + prefix);
        core.setOutput('version', newVersion);
        core.setOutput('prefix', prefix);
    });
}
run();
