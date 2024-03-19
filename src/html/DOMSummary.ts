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

type TJsonElement = {
    nodeName: string;
    text?: string;
    props?: { [key: string]: any };
    children?: TJsonElement[];
}

export function summarize(document: Document): TSummary {
    const extractor = new HtmlExtraction();
    if (!document.body) {
        throw new Error('Document body is empty');
    }
    const result = extractor.processTagsRecursive(document.body);
    console.log(JSON.stringify(result, null, 2));
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
    if (children.length === 0) {
        const propsWithoutId = _.omit(props, 'id');
        const shouldShow = !_.isEmpty(propsWithoutId) || !_.isEmpty(text) || nodeName === 'link';
        return shouldShow ? { ...props, text } : undefined;
    } else if (children.length === 1) {
        return printTagsRecursive(children[0]);
    } else {
        return children.map(printTagsRecursive).filter(i => !_.isEmpty(i));
    }
}

export class HtmlExtraction {
    keyMap = new Map<string, HTMLElement>();

    forbiddenProps = new Set(["meta", "script", "style", "#comment"]);

    inputShowProps = new Set(["type", "placeholder", "value", "role", "autocomplete", "href", "title"]);
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

    private includeProp(prop: string): boolean {
        const propLowerCase = prop.toLowerCase();
        const isAria = propLowerCase.includes('aria-');
        const isData = propLowerCase.includes('data-');
        return this.inputShowProps.has(propLowerCase);
    }

    private getPropsPairs(element: Element): { [key: string]: any } {
        const attributeNames = element.getAttributeNames ? element.getAttributeNames() : [];
        const allInputProps = attributeNames.reduce((acc, name) => {
            return {
                ...acc,
                [name]: element.getAttribute(name),
            };
        }, {} as { [key: string]: any });
        return allInputProps;
    }

    private getElementType(element: HTMLElement): string | undefined {
        return element.nodeName || (element.getAttribute ? element.getAttribute('type') || undefined : undefined);
    }

    private isElementVisible(element: HTMLElement): boolean {
        const type = this.getElementType(element)?.toLowerCase();
        const isHidden = type === 'hidden';
        const bounds = element.getBoundingClientRect ? element.getBoundingClientRect() : undefined;
        return !isHidden && Boolean(bounds?.width && bounds?.height);
    }

    private shouldProcessElement(element: HTMLElement): boolean {
        const type = this.getElementType(element)?.toLowerCase();
        const isComment = element.nodeName === '#comment' || type === '#comment';
        return !isComment && this.isElementVisible(element) && !this.forbiddenProps.has(element.tagName?.toLowerCase());
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
        let props = this.getPropsPairs(element);
        props = _.pickBy(props, (value, key) => this.includeProp(key));
        // inputProps.type = this.getElementType(element);
        props = _.pickBy(props, (value, key) => !_.isEmpty(value));
        
        return props;
    }

    private elementToTLine(element: HTMLElement): TLine {
        const directText = getImmediateTextContent(element)?.trim();

        if (element.tagName?.toLowerCase() == 'a') {
            return this.processLink(element, directText);
        }
        const props = this.getProps(element);

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
            if (!this.shouldProcessElement(child as HTMLElement)) {
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
    
    private convertJsonElement(jsonElement: TJsonElement): TJsonElement | string {
        const isText = jsonElement.nodeName === '#text';
        if (isText && _.isEmpty(jsonElement.children)) {
            return jsonElement.text || '';
        }
        return jsonElement;
    }

    public htmlToJsonRecursive(element: HTMLElement): TJsonElement | string | null {
        if (this.forbiddenProps.has(element.nodeName?.toLowerCase())) {
            return null;
        }
        const childNodes = [...element.childNodes];
        const children = childNodes
            .map(child => this.htmlToJsonRecursive(child as HTMLElement))
            .filter(Boolean)
        const props = this.getProps(element);
        const text = getImmediateTextContent(element);
        const jsonElement = { children, props, text };
        const hasOneChild = children.length === 1;
        
        const filteredJsonElement = _.pickBy(jsonElement, (value, key) => !_.isEmpty(value));
        if (_.isEmpty(filteredJsonElement)) {
            return null;
        }

        if (_.isEmpty(props) && _.isEmpty(text) && hasOneChild) {
            return children[0];
        }

        if (hasOneChild && children[0] === text) {
            delete filteredJsonElement.children;
        }

        return this.convertJsonElement({ ...filteredJsonElement, nodeName: element.nodeName });
    }
}
