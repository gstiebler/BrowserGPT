import _ from 'lodash';
import { clickButton, getSummarizedHtmlFromDocument, openLink, setInputValue } from '../html/browserDriver';
import { HtmlExtraction } from '../html/DOMSummary';
import { clickButtonMsg, htmlDocumentChangedMsg, openLinkMsg, printHtmlMsg, reloadHtmlMsg, setInputValueMsg } from '../constants';


console.log('Yes, it opened');

let localExtractor: HtmlExtraction | undefined;

function executeCommand(msg: any) {
    if (_.isEmpty(localExtractor)) {
        throw Error('localExtractor is not defined');
    }

    const commandToFunction: { [key: string]: Function } = {
        [openLinkMsg]: () => openLink(msg.link),
        [setInputValueMsg]: () => setInputValue(msg.id, msg.value, localExtractor!),
        [clickButtonMsg]: () => clickButton(msg.id, localExtractor!),
        [reloadHtmlMsg]: () => sendHtml(),
        [printHtmlMsg]: () => printHtml(),
    };
    const fn = commandToFunction[msg.command];
    if (_.isEmpty(fn)) {
        throw Error(`Command ${msg.command} is not supported`);
    }
    return fn();
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

function printHtml() {
    const { summary, extractor } = getSummarizedHtmlFromDocument();
    console.log('Summarized HTML');
    console.log(summary);
}

function sendHtml() {
    const { summary, extractor } = getSummarizedHtmlFromDocument();
    const stringSummary = JSON.stringify(summary, null, 1);
    localExtractor = extractor;
    chrome.runtime.sendMessage({ type: htmlDocumentChangedMsg, compactHtml: stringSummary });
}

chrome.runtime.onMessage.addListener(messagesFromReactApp);

window.onload = function () {
    console.log("All resources finished loading!");
    sendHtml();
};
