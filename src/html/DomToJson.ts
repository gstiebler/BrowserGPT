/**
 * Convert a DOM document to a JSON object
 */

const TEXT_NODE = 3;

function cleanText(text: string | null): string {
    if (!text) {
        return '';
    }
    let localText = text.replaceAll('\n', ' ');
    while (localText.includes('  ')) {
        localText = localText.replace('  ', ' ');
    }
    return localText.trim();
}

export function DOMtoJSON(document: Document): HtmlJsonNode {
    if (!document.body) {
        throw new Error('Document body is empty');
    }
    return nodeToObject(document.body);
}

export function nodeToObject(node: Node): HtmlJsonNode {
    const htmlNode = node as HTMLElement;
    const attributes = htmlNode.attributes
        ? Array.from(htmlNode.attributes).reduce((acc, attr) => {
            acc[attr.name] = attr.value;
            return acc;
        }, {} as { [key: string]: string })
        : {};

    const children = Array.from(node.childNodes).map(childNode => {
        if (childNode.nodeType === TEXT_NODE) {
            return cleanText(childNode.textContent);
        } else {
            return nodeToObject(childNode);
        }
    });

    return {
        attributes: attributes,
        id: htmlNode.id,
        value: htmlNode.nodeValue ?? undefined,
        nodeName: htmlNode.nodeName,
        rect: htmlNode.getBoundingClientRect ? htmlNode.getBoundingClientRect() : undefined,
        children: children,
    };
}

export type PropsJsonNode = {
    attributes: { [key: string]: string };
    id?: string;
    value?: string;
    nodeName: string;
    children: HtmlJsonNode[];
    rect?: DOMRect;
}

export function isNodePropsJsonNode(node: HtmlJsonNode): node is PropsJsonNode {
    return (node as PropsJsonNode).attributes !== undefined;
}

export type HtmlJsonNode = PropsJsonNode | String;
