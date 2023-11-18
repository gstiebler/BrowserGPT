import { HtmlExtraction, printTagsRecursive } from "../html/DOMSummary";

import { JSDOM } from "jsdom";
import fs from "fs";
import path from "path";

async function printSummary() {
    const canadaLifeHTML = fs.readFileSync(path.resolve(__dirname, "../../src/test_resources/select_person.html"), "utf8");
    const dom = new JSDOM(canadaLifeHTML);
    const extractor = new HtmlExtraction();
    const summary = measureTime(() => extractor.processTagsRecursive(dom.window.document.body));
    console.log(JSON.stringify(summary, null, 2));
}

async function printResult() {
    const canadaLifeHTML = fs.readFileSync(path.resolve(__dirname, "../../src/test_resources/select_person.html"), "utf8");
    const dom = new JSDOM(canadaLifeHTML);
    const extractor = new HtmlExtraction();
    const summary = extractor.processTagsRecursive(dom.window.document.body);
    const result = measureTime(() => printTagsRecursive(summary));
    console.log(JSON.stringify(result, null, 2));
}

async function printJson() {
    const canadaLifeHTML = fs.readFileSync(path.resolve(__dirname, "../../src/test_resources/select_person.html"), "utf8");
    const dom = new JSDOM(canadaLifeHTML);
    const extractor = new HtmlExtraction();

    // measure the time it takes to convert to JSON
    const start = new Date().getTime();
    const json = extractor.htmlToJsonRecursive(dom.window.document.body);
    const end = new Date().getTime();
    console.log(`Time to convert to JSON: ${end - start}ms`);

    console.log(JSON.stringify(json, null, 2));
}

function measureTime(fn: () => void): void {
    const start = new Date().getTime();
    const result = fn();
    const end = new Date().getTime();
    console.log(`Time to convert to JSON: ${end - start}ms`);
    return result;
}


printJson();
