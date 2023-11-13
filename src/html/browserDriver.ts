import { summarize, HtmlExtraction } from "./DOMSummary";

type TSummarizedHtml = {
    summary: any;
    extractor: HtmlExtraction;
}
export function getSummarizedHtmlFromDocument(): TSummarizedHtml {
    const { summary, extractor } = summarize(document);
    console.log('Summary');
    console.log(summary);
    return { summary, extractor };
}

export function setInputValue(id: string, value: string, extractor?: HtmlExtraction) {
    if (!extractor) {
        throw Error('localExtractor is not defined');
    }
    const realId = extractor.getRealId(id);
    const input = document.getElementById(realId) as HTMLInputElement;
    console.log(`Setting the value ${value} to the input ${realId}`);
    input.value = value;
}

export function openLink(url: string) {
    console.log(`Opening the link ${url}`);
    window.location.href = url;
}

export function clickButton(id: string, extractor?: HtmlExtraction) {
    if (!extractor) {
        throw Error('localExtractor is not defined');
    }
    const realId = extractor.getRealId(id);
    const button = document.getElementById(realId) as HTMLButtonElement;
    console.log(`Clicking the button ${realId}`);
    button.click();
}
