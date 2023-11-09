import _ from 'lodash';
import { clickButton, getSummarizedHtmlFromDocument, openLink, setInputValue } from '../html/browserDriver';
import { HtmlExtraction } from '../html/DOMSummary';


console.log('Yes, it opened');

let localExtractor: HtmlExtraction | undefined;

function executeCommand(msg: any) {
    if (_.isEmpty(localExtractor)) {
        throw Error('localExtractor is not defined');
    }
    if (msg.command === 'openLink') {
        return openLink(msg.link);
    } else if (msg.command === 'setInputValue') {
        return setInputValue(msg.id, msg.value, localExtractor);
    } else if (msg.command === 'clickSubmit') {
        return clickButton(msg.id, localExtractor);
    } else if (msg.command === 'reloadHtml') {
        return sendHtml();
    }
}

function messagesFromReactApp(
    msg: any,
    sender: chrome.runtime.MessageSender,
    sendResponse: (response: any) => void
) {
    const result = executeCommand(msg);
    if (!_.isEmpty(result)) {
        sendResponse({ type: 'ok response', result });
    }
}

function sendHtml() {
    const { summary, extractor } = getSummarizedHtmlFromDocument();
    localExtractor = extractor;
    chrome.runtime.sendMessage({ type: 'htmlDocumentChanged', compactHtml: summary });
}

chrome.runtime.onMessage.addListener(messagesFromReactApp);

window.onload = function () {
    console.log("All resources finished loading!");
    sendHtml();
};
