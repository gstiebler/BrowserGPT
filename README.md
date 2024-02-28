[![Node CI](https://github.com/gstiebler/GuiGPTChromeExt/actions/workflows/webpack.yml/badge.svg)](https://github.com/gstiebler/GuiGPTChromeExt/actions/workflows/webpack.yml)

BrowserGPT uses LLMs APIs to control your browser and perform repetitive actions on your behalf, via a chat interface. It's a Chrome extension.

## Installing the extension
1. Ensure you have Node.js >= 16.
2. Clone this repository
3. Run `npm install` to install the dependencies
4. Run `npm run build` to build the package
5. Load your extension on Chrome by doing the following:
6. Navigate to chrome://extensions/
7. Toggle Developer mode
8. Click on Load unpacked extension
9. Select the build folder that `npm start` generated
