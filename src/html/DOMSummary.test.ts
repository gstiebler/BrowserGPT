import { summarize } from "./DOMSummary";

import { JSDOM } from "jsdom";
import fs from "fs";
import path from "path";
import { nodeToObject } from "./DomToJson";

describe("summary", () => {
    it("happy path", () => {
        const canadaLifeHTML = fs.readFileSync(path.resolve(__dirname, "../test_resources/canada_life.html"), "utf8");
        // create a JSDOM object from the HTML
        const dom = new JSDOM(canadaLifeHTML);
        const jsonHtml = nodeToObject(dom.window.document);
        const { summary, extractor } = summarize(jsonHtml);
        console.log(summary);
        expect(summary).toBe(15);
    });

});
