import _ from "lodash";
import { HtmlJsonNode } from "./DomToJson";

function countNonEmptyProperties(obj: any) {
    return _.reduce(obj, (acc, value) => acc + (_.isEmpty(value) ? 0 : 1), 0);
}

const textProperties = new Set(["text", "content", "aria-label", "alt", "title"]);

function transformFormatRecursive(node: any): any {
    if (_.isString(node)) {
        return node;
    }

    const processedChildren = (node.children ?? [])
        .map(transformFormatRecursive)
        .filter((child: any) => !_.isEmpty(child));

    const { text, children, attributes, ...propsNode } = node;
    if (_.isEmpty(propsNode) && _.isEmpty(processedChildren) && _.isEmpty(attributes) && !_.isEmpty(text)) {
        return text;
    }

    const mainOutput = {
        ...propsNode,
        ...attributes,
    };

    const result = [
        ...(_.isEmpty(text) ? [] : [text]),
        ...processedChildren
    ];
    const nonEmptyPropertyCount = countNonEmptyProperties(mainOutput);
    if (nonEmptyPropertyCount === 0) {

    } else if (nonEmptyPropertyCount === 1 && textProperties.has(_.keys(mainOutput)[0])) {
        result.push(mainOutput[_.keys(mainOutput)[0]]);
    } else {
        result.push(mainOutput);
    }

    return result;
}

export function transformFormat(htmlJsonNode: Partial<HtmlJsonNode>): any {
    return transformFormatRecursive(htmlJsonNode);
}
