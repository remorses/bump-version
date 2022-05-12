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
exports.retry = exports.capitalize = exports.replacePattern = exports.versionRegex = void 0;
const fs = __importStar(require("fs"));
const retry_1 = __importDefault(require("retry"));
const smart_glob_1 = require("smart-glob");
exports.versionRegex = /[0-9]+\.[0-9]+\.[0-9]+(?:-[\w\d\.-]+)?/;
const replacePattern = (p) => __awaiter(void 0, void 0, void 0, function* () {
    const { pattern, replacer, value, ignore = [] } = p;
    const files = yield (0, smart_glob_1.glob)('**', {
        gitignore: true,
        // expandDirectories: true,
        filesOnly: true,
        ignore: ['node_modules', ...ignore],
    });
    console.log('scanned files');
    const linesReplaced = [];
    files.forEach((pathName) => {
        let found = false;
        let currentLine = 0;
        const lines = fs.readFileSync(pathName, 'utf8').toString().split('\n');
        const result = lines
            .reduce((acc, last) => {
            if (acc[acc.length - 1].search(pattern) !== -1) {
                found = true;
                linesReplaced.push({
                    line: currentLine,
                    path: pathName,
                    newValue: value,
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
exports.replacePattern = replacePattern;
const capitalize = (prefix) => {
    return prefix.charAt(0).toUpperCase() + prefix.slice(1);
};
exports.capitalize = capitalize;
// console.log(bump('0.1.0'))
// replacePattern(/.*\[bump\].*/, /[0-9]+\.[0-9]+\.[0-9]+/, '0.1.2')
const defaultOpts = {
    randomize: true,
    onRetry: (e, i) => console.error(`retrying after error: ${e}`),
    retries: 3,
};
function retry(fn, opts = defaultOpts) {
    function run(resolve, reject) {
        var options = opts || {};
        var op;
        op = retry_1.default.operation(options);
        // We allow the user to abort retrying
        // this makes sense in the cases where
        // knowledge is obtained that retrying
        // would be futile (e.g.: auth errors)
        function bail(err) {
            reject(err || new Error('Aborted'));
        }
        function onError(err, num) {
            if (err.bail) {
                bail(err);
                return;
            }
            if (!op.retry(err)) {
                reject(op.mainError());
            }
            else if (options.onRetry) {
                options.onRetry(err, num);
            }
        }
        function runAttempt(num) {
            var val;
            try {
                val = fn(bail, num);
            }
            catch (err) {
                onError(err, num);
                return;
            }
            Promise.resolve(val)
                .then(resolve)
                .catch(function catchIt(err) {
                onError(err, num);
            });
        }
        op.attempt(runAttempt);
    }
    return new Promise(run);
}
exports.retry = retry;
