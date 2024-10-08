import _ from "lodash";
import { HtmlJsonNode, isNodePropsJsonNode, PropsJsonNode } from "./DomToJson";

function removeEmptyPropertiesRecursive(htmlJsonNode: HtmlJsonNode): Partial<HtmlJsonNode> {
    const propsNode = htmlJsonNode as PropsJsonNode;
    if (!isNodePropsJsonNode(propsNode)) {
        return htmlJsonNode;
    }

    const { rect, nodeName, ...otherProps } = propsNode;
    const children = propsNode.children.map(removeEmptyPropertiesRecursive);
    return {
        ...otherProps,
        id: _.isEmpty(propsNode.id) ? undefined : propsNode.id,
        value: _.isEmpty(propsNode.value) ? undefined : propsNode.value,
        attributes: _.isEmpty(propsNode.attributes) ? undefined : propsNode.attributes,
        nodeName: _.isEmpty(nodeName) ? undefined : nodeName,
        children: _.isEmpty(children) ? undefined : children as HtmlJsonNode[], // little hack to make TypeScript happy
    };
}

export function removeEmptyProperties(htmlJsonNode: HtmlJsonNode): Partial<HtmlJsonNode> {
    return removeEmptyPropertiesRecursive(htmlJsonNode);
}
