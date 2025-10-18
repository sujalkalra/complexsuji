'use strict';
Object.defineProperty(exports, "__esModule", { value: true });
let platform = process.platform;
let browsers = [
    {
        // Chrome
        label: 'Google Chrome',
        description: 'Google Chrome is a freeware web browser developed by Google.',
        name: 'chrome',
        standardName: platform === 'win32' ? 'chrome' : (platform === 'darwin' ? 'google chrome' : 'google-chrome')
    },
    {
        // Firefox
        label: 'Mozilla Firefox',
        description: 'Mozilla Firefox is a free and open-source web browser developed by Mozilla Foundation and its subsidiary, Mozilla Corporation.',
        name: 'firefox',
        standardName: 'firefox'
    },
    {
        // Opera
        label: 'Opera',
        description: 'Opera is a web browser for Windows, macOS, and Linux operating systems developed by Opera Software.',
        name: 'opera',
        standardName: 'opera'
    }
];
if (platform === 'win32') {
    browsers.push({
        // IE
        label: 'Microsoft Internet Explorer',
        description: 'Internet Explorer is a series of graphical web browsers developed by Microsoft.',
        name: 'ie',
        standardName: 'iexplore'
    });
}
else if (platform === 'darwin') {
    browsers.push({
        // Safari
        label: 'Apple Safari',
        description: 'Safari is a web browser developed by Apple based on the WebKit engine.',
        name: 'safari',
        standardName: 'safari'
    });
}
exports.default = browsers;
//# sourceMappingURL=browser.js.map