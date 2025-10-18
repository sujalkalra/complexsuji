'use strict';
Object.defineProperty(exports, "__esModule", { value: true });
const vscode = require("vscode");
const browser_1 = require("./browser");
const util_1 = require("./util");
const platform = process.platform;
const defaultBrowser = util_1.getDefaultBrowser();
/**
 * Open Default Browser
 */
function openDefault() {
    if (!util_1.isFocused())
        return;
    let path = util_1.getFilePath();
    if (!util_1.isHtml()) {
        return vscode.window.showInformationMessage('Sorry, only support HTML File');
    }
    util_1.openFileInBrowser(platform, path, defaultBrowser);
}
exports.openDefault = openDefault;
function openFromMenu(file) {
    util_1.openFileInBrowser(platform, util_1.getFilePath(file), defaultBrowser);
}
exports.openFromMenu = openFromMenu;
function openSpecify(file) {
    if (file) {
        file = util_1.getFilePath(file);
    }
    else {
        file = util_1.getFilePath();
    }
    vscode.window.showQuickPick(browser_1.default)
        .then((item) => {
        if (!item)
            return;
        util_1.openFileInBrowser(platform, file, item.standardName);
    });
}
exports.openSpecify = openSpecify;
//# sourceMappingURL=command.js.map