import _ from "lodash";

// define the type TLine
type TLine = {
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
        return { ...props, children: expandedChildren };
    }
    if (!_.isEmpty(text)) {
        return text;
    }
    return children.map(printTagsRecursive);
}

export class HtmlExtraction {
    keyMap = {} as _.Dictionary<HTMLElement>;

    forbiddenProps = new Set(["meta", "script", "style"]);

    inputShowProps = new Set(["type", "placeholder", "aria-label", "value"]);
    alwaysShowTags = new Set(['button', 'input', 'textarea', 'select']);

    public getElementFromId = (id: string): HTMLElement => this.keyMap[id];

    private processLink(element: Element, directText?: string): TLine {
        const inputProps = {
            type: 'link',
            href: element.getAttribute('href'),
        } as any;
        if (!_.isEmpty(directText)) {
            inputProps.text = directText;
        }

        return { nodeName: 'link', text: directText, props: inputProps };
    }

    private addId(element: HTMLElement): string {
        const idIndex = this.keyMap.length;
        const newId = `id${idIndex}`;
        this.keyMap[newId] = element;
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

    private filterElement(element: HTMLElement): boolean {
        const props = this.getProps(element);
        if (props?.type === 'hidden') {
            return true;
        }

        return this.forbiddenProps.has(element.tagName?.toLowerCase());
    }

    private filterTSummaryNode(node: TSummaryNode): boolean {
        if (_.isEmpty(node.line.props)) {
            return _.isEmpty(node.line.text) && _.isEmpty(node.children);
        } else {
            const isLink = node.line.nodeName === 'link';
            const hasText = !_.isEmpty(node.line.text);
            if (!isLink) { 
                return false;
            }
            return !(isLink || hasText);
        }
    }

    private getProps(element: HTMLElement): _.Dictionary<string> | undefined {
        if (this.alwaysShowTags.has(element.tagName?.toLowerCase())) {
            const inputProps = this.getFilteredProps(element);
            inputProps.type = inputProps.type || element.nodeName;
            const filteredInputProps = _.pickBy(inputProps, (value, key) => !_.isEmpty(value));

            this.addId(element);

            return filteredInputProps;
        }
        return undefined;
    }

    private elementToTLine(element: HTMLElement): TLine {
        const directText = getImmediateTextContent(element)?.trim();

        if (element.tagName?.toLowerCase() == 'a') {
            return this.processLink(element, directText);
        }

        return { nodeName: element.nodeName, text: directText, props: this.getProps(element) };
    }

    private findFirstNodeWithContent(node: TSummaryNode): TSummaryNode {
        if (!_.isEmpty(node.line.text) || !_.isEmpty(node.line.props)) {
            return node;
        }
        if (node.children.length > 1) {
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
            if (this.filterElement(child as HTMLElement)) {
                continue;
            }
            const localChild = this.processTagsRecursive(child as HTMLElement);
            if (this.filterTSummaryNode(localChild)) {
                continue;
            }
            const firstNodeWithContent = this.findFirstNodeWithContent(localChild);
            children.push(firstNodeWithContent);
        }
        return { line: this.elementToTLine(element), children };
    }
}
