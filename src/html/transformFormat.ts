import _ from "lodash";
import { HtmlJsonNode } from "./DomToJson";

function transformFormatRecursive(node: any): any {
    if (_.isString(node)) {
        return node;
    }
    const processedChildren = (node.children ?? []).map(transformFormatRecursive);
    
    const { text, children, attributes, ...propsNode } = node;
    if (_.isEmpty(propsNode) && _.isEmpty(processedChildren) && !_.isEmpty(text)) {
        return text;
    }

    const result = [
        {
            ...propsNode,
            ...attributes,
        },
        ...(_.isEmpty(text) ? [] : [text]),
        ...processedChildren
    ];
    return result;
}

export function transformFormat(htmlJsonNode: Partial<HtmlJsonNode>): any {
    return transformFormatRecursive(htmlJsonNode);
}
