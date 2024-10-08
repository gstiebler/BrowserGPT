import { HtmlJsonNode, isNodePropsJsonNode, PropsJsonNode } from "./DomToJson";

function isNodeVisible(htmlJsonNode: HtmlJsonNode): boolean {
    const node = htmlJsonNode as PropsJsonNode;
    if (!isNodePropsJsonNode(node)) { return true; }
    const isAriaHidden = node.attributes["aria-hidden"] === "true";
    if (isAriaHidden) { return false; }
    if (!node.rect) {
        return true;
    }
    return true;
    // return node.rect.width > 5 && node.rect.height > 5;
}

export function pruneInvisibleNodes(htmlJsonRootNode: HtmlJsonNode): HtmlJsonNode {
    return pruneInvisibleNodesRecursive({
        attributes: {},
        value: "",
        nodeName: "",
        children: (htmlJsonRootNode as PropsJsonNode).children,
    });
}

function pruneInvisibleNodesRecursive(htmlJsonNode: HtmlJsonNode): HtmlJsonNode {
    const propsNode = htmlJsonNode as PropsJsonNode;
    if (!isNodePropsJsonNode(propsNode)) {
        return htmlJsonNode;
    }

    return {
        ...htmlJsonNode,
        children: propsNode.children
            .filter(isNodeVisible)
            .map(pruneInvisibleNodesRecursive),
    };
}