import { HtmlExtraction, printTagsRecursive, summarize } from "./DOMSummary";

import { JSDOM } from "jsdom";
import fs from "fs";
import path from "path";

describe("summary", () => {
    it.skip("happy path", () => {
        const canadaLifeHTML = fs.readFileSync(path.resolve(__dirname, "../test_resources/canada_life.html"), "utf8");
        // create a JSDOM object from the HTML
        const dom = new JSDOM(canadaLifeHTML);
        const { summary, extractor } = summarize(dom.window.document);
        console.log(summary);
        expect(summary).toBe(15);
    });

    it.skip("process tags", () => {
        const canadaLifeHTML = fs.readFileSync(path.resolve(__dirname, "../test_resources/canada_life.html"), "utf8");
        // create a JSDOM object from the HTML
        const dom = new JSDOM(canadaLifeHTML);
        const extractor = new HtmlExtraction();
        const result = extractor.processTagsRecursive(dom.window.document.body);
        console.log(JSON.stringify(result, null, 2));
        expect(result).toBe(16);
    });

    it.skip("print tags", () => {
        const canadaLifeHTML = fs.readFileSync(path.resolve(__dirname, "../test_resources/canada_life.html"), "utf8");
        // create a JSDOM object from the HTML
        const dom = new JSDOM(canadaLifeHTML);
        const extractor = new HtmlExtraction();
        const summary = extractor.processTagsRecursive(dom.window.document.body);
        const result = printTagsRecursive(summary);
        console.log(JSON.stringify(result, null, 2));
        expect(result).toBe(16);
    });

    it("compaction", () => {
        const resPath = path.resolve(__dirname, "../test_resources/google.json");
        const googleContent = fs.readFileSync(resPath, "utf8");
        const googleJson = JSON.parse(googleContent);
        const result = printTagsRecursive(googleJson);
        console.log(JSON.stringify(result, null, 2));
        expect(result).toBe(16);
    });
});
