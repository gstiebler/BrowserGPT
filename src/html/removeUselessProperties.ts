import _ from "lodash";
import { cleanText } from "../util";
import { HtmlJsonNode, isNodePropsJsonNode, PropsJsonNode } from "./DomToJson";
import { isInterestingAriaProp, interestingProps } from "./util";

function filterAttributes(attributes: { [key: string]: string }): { [key: string]: string } {
    return _.pickBy(attributes, (value, key) => interestingProps.has(key) || isInterestingAriaProp(key));
}

function removeUselessPropertiesRecursive(htmlJsonNode: HtmlJsonNode): HtmlJsonNode {
    const propsNode = htmlJsonNode as PropsJsonNode;
    if (!isNodePropsJsonNode(propsNode)) {
        return htmlJsonNode;
    }

    const { rect, ...otherProps } = propsNode;
    return {
        ...otherProps,
        id: cleanText(propsNode.id),
        value: cleanText(propsNode.value),
        attributes: filterAttributes(propsNode.attributes),
        children: propsNode.children.map(removeUselessPropertiesRecursive),
    };
}

export function removeUselessProperties(htmlJsonNode: HtmlJsonNode): HtmlJsonNode {
    return removeUselessPropertiesRecursive(htmlJsonNode);
}
