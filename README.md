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
9. Select the build folder that `npm run build` generated

## Developing

### Testing the conversion from visible nodes to useful nodes
1. Open a web page
2. Open the extension
3. Click on "Print HTML"
4. From the DevTools, copy the result in the log to `visibleNodes.json`
5. Run
```
npm run html_to_summary <HTML file at ./dev/testresources/>
```

### Debugging the extension side code
Chrome DevTools: Go to `chrome://extensions`, enable "Developer mode", and click "Inspect views background page" under the extension. This opens a dedicated DevTools window for the background script.