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
const fs = __importStar(require("fs"));
const globby_1 = __importDefault(require("globby"));
exports.replacePattern = (pattern, replacer, value) => __awaiter(void 0, void 0, void 0, function* () {
    const files = yield globby_1.default('**', {
        // TODO should be at top of github repo
        gitignore: true,
        expandDirectories: true,
        onlyFiles: true,
        ignore: ['node_modules'],
    });
    console.log('scanned files');
    const linesReplaced = [];
    files.forEach((pathName) => {
        let found = false;
        let currentLine = 0;
        const lines = fs
            .readFileSync(pathName, 'utf8')
            .toString()
            .split('\n');
        const result = lines
            .reduce((acc, last) => {
            if (acc[acc.length - 1].search(pattern) !== -1) {
                found = true;
                linesReplaced.push({
                    line: currentLine,
                    path: pathName,
                    newValue: value
                });
                last = last.replace(replacer, value);
            }
            currentLine += 1;
            return [...acc, last];
        }, [''])
            .slice(1)
            .join('\n');
        if (found) {
            fs.writeFileSync(pathName, result, 'utf8');
        }
    });
    return { linesReplaced };
    //
});
function bump(version) {
    return version.replace(/^([\d\.]+)([\-|\.])(\d+)$/, function () {
        return arguments[1] + arguments[2] + (Number(arguments[3]) + 1);
    });
}
exports.bump = bump;
exports.capitalize = (prefix) => {
    return prefix.charAt(0).toUpperCase() + prefix.slice(1);
};
// console.log(bump('0.1.0'))
// replacePattern(/.*\[bump\].*/, /[0-9]+\.[0-9]+\.[0-9]+/, '0.1.2')
