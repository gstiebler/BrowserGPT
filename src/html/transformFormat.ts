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

    const { children, attributes, ...propsNode } = node;

    const mainOutput = {
        ...propsNode,
        ...attributes,
    };

    const result = [
        ...processedChildren
    ];
    const nonEmptyPropertyCount = countNonEmptyProperties(mainOutput);
    if (nonEmptyPropertyCount === 0) {

    } else if (nonEmptyPropertyCount === 1 && textProperties.has(_.keys(mainOutput)[0])) {
        result.push(mainOutput[_.keys(mainOutput)[0]]);
    } else {
        result.push(mainOutput);
    }

    if (result.length === 1) {
        if (_.isArray(result[0])) {
            return result[0];
        }
    }
    return result;
}

export function transformFormat(htmlJsonNode: Partial<HtmlJsonNode>): any {
    return transformFormatRecursive(htmlJsonNode);
}
