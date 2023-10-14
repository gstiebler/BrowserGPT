import { compact, summarize } from "./DOMSummary";

import { JSDOM } from "jsdom";
import fs from "fs";
import path from "path";

describe.skip("summary", () => {
    it("happy path", () => {
        const canadaLifeHTML = fs.readFileSync(path.resolve(__dirname, "../test_resources/canada_life.html"), "utf8");
        // create a JSDOM object from the HTML
        const dom = new JSDOM(canadaLifeHTML);
        const { summary, extractor } = summarize(dom.window.document);
        const compactSummary = compact(summary);
        // console.log(JSON.stringify(summary, null, 2));
        // console.log(compactSummary);
        expect(summary).toBe(15);
    });
});
