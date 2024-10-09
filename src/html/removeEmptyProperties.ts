import _ from "lodash";
import { HtmlJsonNode, isNodePropsJsonNode, PropsJsonNode } from "./DomToJson";
import { usefulTypes } from "./util";

function removeEmptyPropertiesRecursive(htmlJsonNode: HtmlJsonNode): Partial<HtmlJsonNode> {
    const propsNode = htmlJsonNode as PropsJsonNode;
    if (!isNodePropsJsonNode(propsNode)) {
        return htmlJsonNode;
    }

    const { rect, nodeName, ...otherProps } = propsNode;
    const children = propsNode.children.map(removeEmptyPropertiesRecursive);
    const isTypeUseful = usefulTypes.has(nodeName?.toLowerCase());
    return {
        ...otherProps,
        id: _.isEmpty(propsNode.id) ? undefined : propsNode.id,
        value: _.isEmpty(propsNode.value) ? undefined : propsNode.value,
        attributes: _.isEmpty(propsNode.attributes) ? undefined : propsNode.attributes,
        nodeName: !isTypeUseful ? undefined : nodeName,
        children: _.isEmpty(children) ? undefined : children as HtmlJsonNode[], // little hack to make TypeScript happy
    };
}

export function removeEmptyProperties(htmlJsonNode: HtmlJsonNode): Partial<HtmlJsonNode> {
    return removeEmptyPropertiesRecursive(htmlJsonNode);
}
