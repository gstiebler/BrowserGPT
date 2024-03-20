import _ from "lodash";
import { HtmlJsonNode, isNodePropsJsonNode, PropsJsonNode } from "./DomToJson";
import { HtmlExtraction } from "./HTMLExtraction";
import { removeUselessProperties } from "./removeUselessProperties";
import { pruneUselessNodes } from "./pruneUselessNodes";


const forbiddenProps = new Set(["meta", "script", "style", "#comment"]);

export function summarize(jsonHtml: HtmlJsonNode): HtmlJsonNode {
    const extractor = new HtmlExtraction();
    console.log(JSON.stringify(jsonHtml, null, 2));

    // const visibleNodes = pruneInvisibleNodes(jsonHtml);
    // const usefulProperties = removeUselessProperties(jsonHtml);
    const usefulNodes = pruneUselessNodes(jsonHtml);
    const summary = processTagsRecursive(usefulNodes);
    return summary;
}

/*
export function printTagsRecursive(node: TSummaryNode): any {
    const { line, children } = node;
    const { nodeName, text, props } = line;

    const convertedChildren = children.map(printTagsRecursive).filter(i => !_.isEmpty(i));
    const propsWithoutId = _.omit(props, 'id', 'role');
    const shouldShow = !_.isEmpty(propsWithoutId) || !_.isEmpty(text) || nodeName === 'link';

    const result = convertedChildren;
    if (shouldShow) {
        result.push({ ...props, text });
    }
    return result.length === 1 ? result[0] : result;
}
*/
