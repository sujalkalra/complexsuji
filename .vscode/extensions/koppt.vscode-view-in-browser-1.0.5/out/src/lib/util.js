'use strict';
Object.defineProperty(exports, "__esModule", { value: true });
const path = require("path");
const vscode = require("vscode");
const browser_1 = require("./browser");
const child_process_1 = require("child_process");
function isFocused() {
    return !!vscode.window.activeTextEditor;
}
exports.isFocused = isFocused;
function isHtml() {
    return vscode.window.activeTextEditor.document.languageId === 'html';
}
exports.isHtml = isHtml;
function getFilePath(file = '') {
    if (!file) {
        let uri = vscode.window.activeTextEditor.document.uri;
        return path.resolve(uri.fsPath);
    }
    return path.resolve(file);
}
exports.getFilePath = getFilePath;
function getStandardBrowserName(name) {
    name = name && name.toLowerCase();
    for (let i = 0, len = browser_1.default.length; i < len; i++) {
        if (browser_1.default[i].name === name) {
            return browser_1.default[i].standardName;
        }
    }
    return '';
}
function getDefaultBrowser() {
    let browser = '';
    let config = vscode.workspace.getConfiguration('view-in-browser');
    if (config.default) {
        browser = config.default;
    }
    return browser;
}
exports.getDefaultBrowser = getDefaultBrowser;
function openFileInBrowser(platform, path, browser) {
    let cmd;
    let browserName = getStandardBrowserName(browser);
    switch (platform) {
        case 'win32':
            cmd = browserName ? `start ${browserName} "${path}"` : `start "" "${path}"`;
            break;
        case 'darwin':
            cmd = browserName ? `open "${path}" -a "${browserName}"` : `open "${path}"`;
            break;
        default:
            cmd = browserName ? `${browserName} "${path}"` : `xdg-open "${path}"`;
            break;
    }
    child_process_1.exec(cmd, err => {
        if (err) {
            vscode.window.showErrorMessage('Sorry, error occured!');
        }
    });
}
exports.openFileInBrowser = openFileInBrowser;
//# sourceMappingURL=util.js.map