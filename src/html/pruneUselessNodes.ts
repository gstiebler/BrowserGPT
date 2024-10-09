import _ from "lodash";
import { HtmlJsonNode, isNodePropsJsonNode, PropsJsonNode } from "./DomToJson";
import { interestingAriaProps } from "./removeUselessProperties";
import { getNonEmptyProperties } from "./util";

const usefulAttributes = new Set(["text", "value", "title", "placeholder"]);
const uselessTypes = new Set(["meta", "script", "style", "#comment"]);

export function pruneUselessNodes(htmlJsonNode: HtmlJsonNode): HtmlJsonNode {
    const propsNode = htmlJsonNode as PropsJsonNode;
    if (!isNodePropsJsonNode(propsNode)) {
        return htmlJsonNode;
    }

    const isUselessType = uselessTypes.has(propsNode?.nodeName?.toLowerCase());
    if (isUselessType) {
        return "";
    }

    const usefulChildren = (propsNode.children?.map(pruneUselessNodes).filter((node) => node !== null && !_.isEmpty(node)) ?? []) as HtmlJsonNode[];
    if (usefulChildren.length === 0) {
        const combined = getNonEmptyProperties({
            ...propsNode,
            ...propsNode.attributes,
        });
        const hasUsefulProperties = Object.keys(combined ?? {}).some((key) => usefulAttributes.has(key) || interestingAriaProps.has(key));
        return hasUsefulProperties ? htmlJsonNode : "";
    }

    return {
        ...htmlJsonNode,
        children: usefulChildren,
    };
}
