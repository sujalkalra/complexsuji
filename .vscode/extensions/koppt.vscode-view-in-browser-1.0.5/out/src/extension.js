'use strict';
Object.defineProperty(exports, "__esModule", { value: true });
const vscode = require("vscode");
const command_1 = require("./lib/command");
function activate(context) {
    let openCommand = vscode.commands.registerCommand('extension.viewInBrowser', () => {
        command_1.openDefault();
    });
    let openCommandFromMenu = vscode.commands.registerCommand('extension.viewInBrowserFromMenu', fileUrl => {
        command_1.openFromMenu(fileUrl.fsPath);
    });
    let openCommandFromSpecify = vscode.commands.registerCommand('extension.viewInSpecifyBrowser', fileUrl => {
        command_1.openSpecify(fileUrl.fsPath);
    });
    context.subscriptions.push(openCommand);
    context.subscriptions.push(openCommandFromMenu);
    context.subscriptions.push(openCommandFromSpecify);
}
exports.activate = activate;
// this method is called when your extension is deactivated
function deactivate() {
}
exports.deactivate = deactivate;
//# sourceMappingURL=extension.js.map