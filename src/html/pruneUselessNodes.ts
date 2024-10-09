import _ from "lodash";
import { HtmlJsonNode, isNodePropsJsonNode, PropsJsonNode } from "./DomToJson";
import { forbiddenTypes, getNonEmptyProperties, interestingAriaProps, usefulAttributes } from "./util";

export function pruneUselessNodes(htmlJsonNode: HtmlJsonNode): HtmlJsonNode {
    const propsNode = htmlJsonNode as PropsJsonNode;
    if (!isNodePropsJsonNode(propsNode)) {
        return htmlJsonNode;
    }

    const isForbiddenType = forbiddenTypes.has(propsNode?.nodeName?.toLowerCase());
    if (isForbiddenType) {
        return "";
    }

    const usefulChildren = (propsNode.children?.map(pruneUselessNodes).filter((node) => node !== null && !_.isEmpty(node)) ?? []) as HtmlJsonNode[];
    if (usefulChildren.length === 0) {
        const isInput = propsNode.nodeName?.toLowerCase() === "input";
        const combined = getNonEmptyProperties({
            ...propsNode,
            ...propsNode.attributes,
        });
        const hasUsefulProperties = Object.keys(combined ?? {}).some((key) => usefulAttributes.has(key) || interestingAriaProps.has(key));
        return (hasUsefulProperties || isInput) ? htmlJsonNode : "";
    }

    return {
        ...htmlJsonNode,
        children: usefulChildren,
    };
}
