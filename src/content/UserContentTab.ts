import _ from 'lodash';
import { clickButton, getSummarizedHtmlFromDocument, openLink, setInputValue } from '../html/browserDriver';
import { clickButtonMsg, htmlDocumentChangedMsg, openLinkMsg, printHtmlMsg, reloadHtmlMsg, setInputValueMsg } from '../constants';
import { HtmlExtraction } from '../html/HTMLExtraction';


console.log('Yes, it opened');

let localExtractor: HtmlExtraction | undefined;

function executeCommand(msg: any) {
    console.log(`Executing command ${msg.command}`);
    const commandToFunction: { [key: string]: Function } = {
        [openLinkMsg]: () => openLink(msg.link),
        [setInputValueMsg]: () => setInputValue(msg.id, msg.value, localExtractor),
        [clickButtonMsg]: () => clickButton(msg.id, localExtractor),
        [reloadHtmlMsg]: () => sendHtml(),
        [printHtmlMsg]: () => printHtml(),
    };
    const fn = commandToFunction[msg.command];
    if (!fn) {
        throw Error(`Command ${msg.command} is not supported`);
    }
    return fn();
}

function messagesFromReactApp(
    msg: any,
    sender: chrome.runtime.MessageSender,
    sendResponse: (response: any) => void
) {
    console.log(`Message received from React App: ${JSON.stringify(msg)}`)
    const result = executeCommand(msg);
    if (!_.isEmpty(result)) {
        sendResponse({ type: 'ok response', result });
    }
}

function printHtml() {
    const { summary, extractor } = getSummarizedHtmlFromDocument();
    localExtractor = extractor;
    console.log('Summarized HTML');
    console.log(summary);
}

function sendHtml() {
    const { summary, extractor } = getSummarizedHtmlFromDocument();
    localExtractor = extractor;
    const stringSummary = JSON.stringify(summary, null, 1);
    chrome.runtime.sendMessage({ type: htmlDocumentChangedMsg, compactHtml: stringSummary });
}

chrome.runtime.onMessage.addListener(messagesFromReactApp);

window.onload = function () {
    console.log("All resources finished loading!");

    // sendHtml();
};
