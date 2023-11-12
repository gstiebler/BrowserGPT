import _ from 'lodash';
import { clickButton, getSummarizedHtmlFromDocument, openLink, setInputValue } from '../html/browserDriver';
import { HtmlExtraction } from '../html/DOMSummary';
import { clickButtonMsg, openLinkMsg, reloadHtmlMsg, setInputValueMsg } from '../constants';


console.log('Yes, it opened');

let localExtractor: HtmlExtraction | undefined;

function executeCommand(msg: any) {
    if (_.isEmpty(localExtractor)) {
        throw Error('localExtractor is not defined');
    }
    if (msg.command === openLinkMsg) {
        return openLink(msg.link);
    } else if (msg.command === setInputValueMsg) {
        return setInputValue(msg.id, msg.value, localExtractor);
    } else if (msg.command === clickButtonMsg) {
        return clickButton(msg.id, localExtractor);
    } else if (msg.command === reloadHtmlMsg) {
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
    const stringSummary = JSON.stringify(summary, null, 1);
    localExtractor = extractor;
    chrome.runtime.sendMessage({ type: 'htmlDocumentChanged', compactHtml: stringSummary });
}

chrome.runtime.onMessage.addListener(messagesFromReactApp);

window.onload = function () {
    console.log("All resources finished loading!");
    sendHtml();
};
