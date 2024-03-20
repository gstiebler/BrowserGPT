import _ from "lodash";
import { HtmlJsonNode, isNodePropsJsonNode, PropsJsonNode } from "./DomToJson";
import { interestingAriaProps } from "./removeUselessProperties";

const usefulAttributes = new Set(["text", "value", "title", "placeholder"]);
const uselessTypes = new Set(["meta", "script", "style", "#comment"]);
const usefulTypes = new Set(["input", "textarea", "select", "button"]);

export function pruneUselessNodes(htmlJsonNode: HtmlJsonNode): HtmlJsonNode {
    const propsNode = htmlJsonNode as PropsJsonNode;
    if (!isNodePropsJsonNode(propsNode)) {
        return htmlJsonNode;
    }

    const isUselessType = uselessTypes.has(propsNode?.nodeName?.toLowerCase());
    if (isUselessType) {
        return "";
    }

    const hasUsefulProperties = Object.keys(propsNode?.attributes ?? {}).some((key) => usefulAttributes.has(key) ||  interestingAriaProps.has(key));
    const isUsefulType = usefulTypes.has(propsNode?.nodeName ?? "");
    const usefulChildren = (propsNode.children?.map(pruneUselessNodes).filter((node) => node !== null && !_.isEmpty(node)) ?? []) as HtmlJsonNode[];
    const hasText = !_.isEmpty(propsNode.text?.trim());
    if (usefulChildren.length === 0) {
        return hasUsefulProperties || isUsefulType || hasText ? htmlJsonNode : "";
    } else if (usefulChildren.length === 1) {
        return pruneUselessNodes(usefulChildren[0]);
    } else {
        return {
            ...htmlJsonNode,
            children: usefulChildren,
        };
    }
}
