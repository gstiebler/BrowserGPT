import { summarize } from "./DOMSummary";
import { HtmlJsonNode, nodeToObject } from "./DomToJson";

export function getSummarizedHtmlFromDocument(): HtmlJsonNode {
    const jsonHtml = nodeToObject(document);
    const summary = summarize(jsonHtml);
    console.log('Summary');
    console.log(summary);
    return summary;
}

export function setInputValue(id: string, value: string) {
    const input = document.getElementById(id) as HTMLInputElement
    console.log(`Setting the value ${value} to the input ${id}`);
    input.value = value;
}

export function openLink(url: string) {
    console.log(`Opening the link ${url}`);
    window.location.href = url;
}

export function clickButton(id: string) {
    const button = document.getElementById(id) as HTMLInputElement
    console.log(`Clicking the button ${id}`);
    button.click();
}
