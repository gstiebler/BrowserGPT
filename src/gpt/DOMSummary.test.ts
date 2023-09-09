import { summarize } from "./DOMSummary";

import { JSDOM } from "jsdom";
import fs from "fs";
import path from "path";

describe("test add function", () => {
    it("should return 15 for add(10,5)", () => {
        // open the text file in ../test_resources/canada_life.html into canadaLifeHTML
        // get the path of the file
        const canadaLifeHTML = fs.readFileSync(path.resolve(__dirname, "../test_resources/canada_life.html"), "utf8");
        // create a JSDOM object from the HTML
        const dom = new JSDOM(canadaLifeHTML);
        const result = summarize(dom.window.document);
        console.log(JSON.stringify(result, null, 2));
        expect(result).toBe(15);
    });
});
