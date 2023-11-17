import _ from "lodash";

// define the type TLine
type TLine = {
    element: HTMLElement;
    nodeName: string;
    text?: string;
    props?: { [key: string]: any };
}
type TSummaryNode = {
    line: TLine;
    children: TSummaryNode[];
}

type TSummary = {
    summary: any;
    extractor: HtmlExtraction;
}
export function summarize(document: Document): TSummary {
    const extractor = new HtmlExtraction();
    if (!document.body) {
        throw new Error('Document body is empty');
    }
    const result = extractor.processTagsRecursive(document.body);
    const summary = printTagsRecursive(result);
    return { summary, extractor };
}

function cleanText(text: string): string {
    let localText = text.replaceAll('\n', ' ');
    while (localText.includes('  ')) {
        localText = localText.replace('  ', ' ');
    }
    return localText.trim();
}

function getImmediateTextContent(node: Element): string | null {
    const clonedNode = node.cloneNode(true);
    while (clonedNode.firstChild) {
        clonedNode.removeChild(clonedNode.firstChild);
    }
    const text = _.isEmpty(clonedNode.textContent) ? (node as any).text : clonedNode.textContent;
    return text ? cleanText(text) : null;
}

export function printTagsRecursive(node: TSummaryNode): any {
    const { line, children } = node;
    const { nodeName, text, props } = line;
    if (!_.isEmpty(props)) {
        const expandedChildren = children.length > 0 ? children.map(printTagsRecursive) : undefined;
        const firstexpandedChild = expandedChildren?.[0];
        const hasOneTextChild = children.length === 1 && _.isEmpty(firstexpandedChild?.line?.props?.text);
        if (hasOneTextChild) {
            const singleChildText = children[0].line.text;
            return { ...props, text: singleChildText };
        } else {
            return props;
        }
    }
    if (!_.isEmpty(text)) {
        return text;
    }
    return children.map(printTagsRecursive);
}

export class HtmlExtraction {
    keyMap = new Map<string, HTMLElement>();

    forbiddenProps = new Set(["meta", "script", "style"]);

    inputShowProps = new Set(["type", "placeholder", "aria-label", "value"]);
    alwaysShowTags = new Set(['input', 'textarea', 'select']);

    public getElementFromId = (id: string): HTMLElement | undefined => this.keyMap.get(id);

    private processLink(element: HTMLElement, directText?: string): TLine {
        const inputProps = {
            type: 'link',
            href: element.getAttribute('href'),
        } as any;
        if (!_.isEmpty(directText)) {
            inputProps.text = directText;
        }

        return { nodeName: 'link', text: directText, props: inputProps, element };
    }

    private addId(element: HTMLElement): string {
        const idIndex = this.keyMap.size;
        const newId = `id${idIndex}`;
        this.keyMap.set(newId, element);
        return newId
    }

    private getFilteredProps(element: Element): { [key: string]: any } {
        const attributeNames = element.getAttributeNames();
        const allInputProps = attributeNames.reduce((acc, name) => {
            return {
                ...acc,
                [name]: element.getAttribute(name),
            };
        }, {} as { [key: string]: any });
        // return only the props we want
        return _.pickBy(allInputProps, prop => this.inputShowProps.has(prop.toLowerCase()));
    }

    private getElementType(element: HTMLElement): string | undefined {
        return element.nodeName || (element.getAttribute ? element.getAttribute('type') || undefined : undefined);
    }

    private shouldProcessChildren(element: HTMLElement): boolean {
        const type = this.getElementType(element)?.toLowerCase();
        const isHidden = type === 'hidden';
        const isComment = element.nodeName === '#comment' || type === '#comment';
        if (isHidden || isComment) {
            return false;
        }

        return !this.forbiddenProps.has(element.tagName?.toLowerCase());
    }

    private shouldProcessElement(element: HTMLElement): boolean {
        const type = this.getElementType(element)?.toLowerCase();
        const isButton = type === 'button';
        const shownTag = this.alwaysShowTags.has(element.tagName?.toLowerCase());
        return isButton || shownTag;
    }

    private invalidTSummaryNode(node: TSummaryNode): boolean {
        if (_.isEmpty(node.line.props)) {
            return _.isEmpty(node.line.text) && _.isEmpty(node.children);
        } else {
            const isLink = node.line.nodeName === 'link' && node.line.text !== 'javascript:void(0)';
            const hasText = !_.isEmpty(node.line.text);
            if (!isLink) { 
                return false;
            }
            const isButton = node.line.nodeName.toLowerCase() === 'button';
            return !(isLink || hasText) || (isButton && !hasText);
        }
    }

    private getProps(element: HTMLElement): _.Dictionary<string> {
        const inputProps = this.getFilteredProps(element);
        inputProps.type = this.getElementType(element);
        const filteredInputProps = _.pickBy(inputProps, (value, key) => !_.isEmpty(value));
        
        return filteredInputProps;
    }

    private elementToTLine(element: HTMLElement): TLine {
        const directText = getImmediateTextContent(element)?.trim();

        if (element.tagName?.toLowerCase() == 'a') {
            return this.processLink(element, directText);
        }
        const props = this.shouldProcessElement(element) ? this.getProps(element) : undefined;

        if (props) {
            props.id = this.addId(element);
        }

        return { nodeName: element.nodeName, text: directText, props, element };
    }

    private findFirstNodeWithContent(node: TSummaryNode): TSummaryNode {
        if (!_.isEmpty(node.line.text) || !_.isEmpty(node.line.props)) {
            return node;
        }
        const isButton = node.line.nodeName.toLowerCase() === 'button';
        if (node.children.length > 1 || isButton) {
            return node;
        }
        if (node.children.length === 1) {
            return this.findFirstNodeWithContent(node.children[0]);
        }
        throw new Error('impossible situation');
    }

    public processTagsRecursive(element: HTMLElement): TSummaryNode {
        const children = [] as TSummaryNode[];
        for (const child of element.childNodes) {
            if (!this.shouldProcessChildren(child as HTMLElement)) {
                continue;
            }
            const localChild = this.processTagsRecursive(child as HTMLElement);
            if (this.invalidTSummaryNode(localChild)) {
                continue;
            }
            const firstNodeWithContent = this.findFirstNodeWithContent(localChild);
            children.push(firstNodeWithContent);
        }
        return { line: this.elementToTLine(element), children };
    }
}
