import { JSDOM } from "jsdom";
import fs from "fs";
import path from "path";
import { nodeToObject } from "../html/DomToJson";
import { pruneInvisibleNodes } from "../html/pruneInvisibleNodes";
import { removeUselessProperties } from "../html/removeUselessProperties";
import { pruneUselessNodes } from "../html/pruneUselessNodes";
import { removeEmptyProperties } from "../html/removeEmptyProperties";
import { transformFormat } from "../html/transformFormat";

// get a file name from the command line arguments
const fileName = process.argv[2];

const canadaLifeHTML = fs.readFileSync(path.resolve(__dirname, `../test_resources/${fileName}.html`), "utf8");

const outputDir = path.resolve(__dirname, `../../temp_output/${fileName}`);
if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir);
}

const dom = new JSDOM(canadaLifeHTML);
let data = nodeToObject(dom.window.document);
fs.writeFileSync(path.resolve(__dirname, `${outputDir}/1_base.json`), JSON.stringify(data, null, 2));

const pipeline = [
    { step: "visible", func: pruneInvisibleNodes },
    { step: "useful_properties", func: removeUselessProperties },
    { step: "useful_nodes", func: pruneUselessNodes },
];

pipeline.forEach(({ step, func }, index) => {
    data = func(data);
    fs.writeFileSync(path.resolve(__dirname, `${outputDir}/${index + 2}_${step}.json`), JSON.stringify(data, null, 2));
});

const noEmptyProperties = removeEmptyProperties(data);
fs.writeFileSync(path.resolve(__dirname, `${outputDir}/5_no_empty_properties.json`), JSON.stringify(noEmptyProperties, null, 2));

const summary = transformFormat(noEmptyProperties);
fs.writeFileSync(path.resolve(__dirname, `${outputDir}/6_summary.json`), JSON.stringify(summary, null, 2));
