import { compact, summarize, HtmlExtraction } from "./DOMSummary";

type TSummarizedHtml = {
    compactSummary: any;
    extractor: HtmlExtraction;
}
export function getSummarizedHtmlFromDocument(): TSummarizedHtml {
    const { summary, extractor } = summarize(document);
    console.log('Summary without compaction');
    console.log(summary);
    const compactSummary = compact(summary);
    console.log('Summary with compaction');
    console.log(compactSummary);
    return { compactSummary, extractor };
}

export function setInputValue(id: string, value: string, extractor: HtmlExtraction) {
    const realId = extractor.getRealId(id);
    const input = document.getElementById(realId) as HTMLInputElement;
    input.value = value;
}

export function openLink(url: string) {
    window.location.href = url;
}

export function clickButton(id: string, extractor: HtmlExtraction) {
    const realId = extractor.getRealId(id);
    const button = document.getElementById(realId) as HTMLButtonElement;
    button.click();
}
