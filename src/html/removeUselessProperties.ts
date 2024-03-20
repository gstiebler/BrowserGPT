import _ from "lodash";
import { cleanText } from "../util";
import { HtmlJsonNode, isNodePropsJsonNode, PropsJsonNode } from "./DomToJson";

const alwaysKeys = new Set(["role", "type", "placeholder", "value", "href", "title"]);
export const interestingAriaProps = new Set(["aria-label", "aria-labelledby", "aria-describedby", "aria-details", "aria-placeholder", "aria-roledescription", "aria-valuetext"]);

function filterAttributes(attributes: { [key: string]: string }): { [key: string]: string } {
    return _.pickBy(attributes, (value, key) => alwaysKeys.has(key) || interestingAriaProps.has(key));
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
        text: cleanText(propsNode.text),
        attributes: filterAttributes(propsNode.attributes),
        children: propsNode.children.map(removeUselessPropertiesRecursive),
    };
}

export function removeUselessProperties(htmlJsonNode: HtmlJsonNode): HtmlJsonNode {
    return removeUselessPropertiesRecursive(htmlJsonNode);
}
