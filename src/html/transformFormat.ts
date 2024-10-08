import _ from "lodash";
import { HtmlJsonNode } from "./DomToJson";
import { getNonEmptyProperties } from "./util";

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
    const nonEmptyProperties = getNonEmptyProperties(mainOutput);
    const mainOutputKeys = _.keys(nonEmptyProperties);
    if (mainOutputKeys.length === 0) {

    } else if (mainOutputKeys.length === 1) {
        const firstKey = mainOutputKeys[0];
        if (textProperties.has(firstKey)) {
            result.push(mainOutput[firstKey]);
        } else {
            result.push(mainOutput);
        }
    } else {
        result.push(mainOutput);
    }

    if (result.length === 1) {
        return result[0];
    }
    return result;
}

export function transformFormat(htmlJsonNode: Partial<HtmlJsonNode>): any {
    return transformFormatRecursive(htmlJsonNode);
}
