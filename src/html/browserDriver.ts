import { compact, summarize } from "./DOMSummary";

export function getSummarizedHtmlFromDocument() {
    console.log('Executing...');
    const summary = summarize(document);
    const compactSummary = compact(summary);
    return compactSummary;
}

export function setInputValue(id: string, value: string) {
    const input = document.getElementById(id) as HTMLInputElement;
    input.value = value;
}

export function openLink(url: string) {
    window.location.href = url;
}

export function clickButton(id: string) {
    const button = document.getElementById(id) as HTMLButtonElement;
    button.click();
}
