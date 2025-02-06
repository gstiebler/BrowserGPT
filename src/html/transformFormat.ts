import _ from "lodash";
import { HtmlJsonNode } from "./DomToJson";
import { getNonEmptyProperties, textProperties } from "./util";

const getOnePropRecursive = (node: any): any => {
    if (!node) {
        return node;
    }
    // if the object has only one property, return that property
    const nonEmptyProperties = getNonEmptyProperties(node);
    const keys = _.keys(nonEmptyProperties);
    if (keys.length === 1) {
        const key = keys[0];
        return getOnePropRecursive(nonEmptyProperties[key]);
    }
}


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
        const value = textProperties.has(firstKey) ? mainOutput[firstKey] : mainOutput;
        const processedValue = getOnePropRecursive(value);
        if (processedValue) {
            result.push(processedValue);
        }
    } else {
        result.push(mainOutput);
    }

    // Removes redundant arrays
    if (result.length === 1) {
        return result[0];
    }
    return result;
}

export function transformFormat(htmlJsonNode: Partial<HtmlJsonNode>): any {
    return transformFormatRecursive(htmlJsonNode);
}
