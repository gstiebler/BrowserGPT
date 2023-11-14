import { HtmlExtraction, printTagsRecursive } from "../html/DOMSummary";

import { JSDOM } from "jsdom";
import fs from "fs";
import path from "path";

async function execute() {
    const canadaLifeHTML = fs.readFileSync(path.resolve(__dirname, "../../src/test_resources/canada_life.html"), "utf8");
    // create a JSDOM object from the HTML
    const dom = new JSDOM(canadaLifeHTML);
    const extractor = new HtmlExtraction();
    const summary = extractor.processTagsRecursive(dom.window.document.body);
    const result = printTagsRecursive(summary);
    console.log(JSON.stringify(result, null, 2));
}

execute();
