import _ from 'lodash';
import { clickButton, getSummarizedHtmlFromDocument, openLink, setInputValue } from '../html/browserDriver';

const button = new DOMParser().parseFromString(
    '<button>Click to open side panel</button>',
    'text/html'
).body.firstElementChild!;

console.log('Yes, it opened');

button.addEventListener('click', function () {
    chrome.runtime.sendMessage({ type: 'open_side_panel' });
});
document.body.append(button);

function executeCommand(msg: any) {
    if (msg.command === 'openLink') {
        return openLink(msg.link);
    } else if (msg.command === 'setInputValue') {
        return setInputValue(msg.id, msg.value);
    } else if (msg.command === 'clickSubmit') {
        return clickButton(msg.id);
    }
}

function messagesFromReactApp(
    msg: any,
    sender: chrome.runtime.MessageSender,
    sendResponse: (response: any) => void
) {
    console.log(`Received message from React app: ${JSON.stringify(msg)}`);
    const result = executeCommand(msg);
    if (!_.isEmpty(result)) {
        sendResponse({ type: 'ok response', result });
    }
}

chrome.runtime.onMessage.addListener(messagesFromReactApp);

window.onload = function () {
    console.log("All resources finished loading!");
    const result = getSummarizedHtmlFromDocument();
    chrome.runtime.sendMessage({ type: 'htmlDocumentChanged', compactHtml: result });
};