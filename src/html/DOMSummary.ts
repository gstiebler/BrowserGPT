import _ from "lodash";
import yaml from 'js-yaml';

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
    const result = extractor.processTagsRecursive(document.body) as TSummaryNode;
    const toPrint = result instanceof Array ? result[0] : result;
    const summary = printTagsRecursive(toPrint);
    const summaryYaml = yaml.dump(summary);
    return { summary: summaryYaml, extractor };
}

function cleanText(text: string): string {
    return text
        .replaceAll('\n', ' ')
        .replaceAll('  ', ' ')
        .trim();
}

function getImmediateTextContent(node: Element): string | null {
    const clonedNode = node.cloneNode(true);
    while (clonedNode.firstChild) {
        clonedNode.removeChild(clonedNode.firstChild);
    }
    const text = clonedNode.textContent;
    return text ? cleanText(text) : null;
}

export function printTagsRecursive(node: TSummaryNode): any[] {
    const { line, children } = node;
    const { nodeName, text, props } = line;
    if (!_.isEmpty(props)) {
        return [props];
    }
    if (!_.isEmpty(text)) {
        return [text];
    }
    return children.map(printTagsRecursive);
}

export class HtmlExtraction {
    key_map = {} as _.Dictionary<string>;
    id_counter = 0

    forbiddenProps = new Set(["META", "SCRIPT", "STYLE"]);

    inputShowProps = new Set(["type", "placeholder", "aria-label", "id", "value"]);
    alwaysShowTags = new Set(['BUTTON', 'INPUT', 'TEXTAREA', 'SELECT']);

    getRealId = (id: string) => this.key_map[id] || id;

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

    private addId(originalId: string): string {
        this.id_counter += 1
        const newId = `id${this.id_counter}`;
        this.key_map[newId] = originalId;
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
        return _.pick(allInputProps, Array.from(this.inputShowProps));
    }

    filterElement(element: Element): boolean {
        if (element.getAttribute && element.getAttribute('type') === 'hidden') {
            return false;
        }

        return this.forbiddenProps.has(element.tagName);
    }

    filterTSummaryNode(node: TSummaryNode): boolean {
        return _.isEmpty(node.line.text) && _.isEmpty(node.line.props) && _.isEmpty(node.children);
    }

    getProps(element: Element): _.Dictionary<string> | undefined {
        if (this.alwaysShowTags.has(element.tagName)) {
            const inputProps = this.getFilteredProps(element);
            inputProps.type = inputProps.type || element.nodeName;
            const filteredInputProps = _.pickBy(inputProps, (value, key) => !_.isEmpty(value));

            const originalId = filteredInputProps.id;
            if (originalId) {
                filteredInputProps.id = this.addId(originalId);
            }

            return filteredInputProps;
        }
        return undefined;
    }

    elementToTLine(element: Element): TLine {
        const directText = getImmediateTextContent(element)?.trim();

        if (element.tagName === 'A') {
            return this.processLink(element, directText);
        }

        return { nodeName: element.nodeName, text: directText, props: this.getProps(element) };
    }

    findFirstNodeWithContent(node: TSummaryNode): TSummaryNode {
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
        

    processTagsRecursive(element: Element): TSummaryNode {
        const children = [] as TSummaryNode[];
        for (const child of element.childNodes) {
            if (this.filterElement(child as Element)) {
                continue;
            }
            const localChild = this.processTagsRecursive(child as Element);
            if (this.filterTSummaryNode(localChild)) {
                continue;
            }
            const firstNodeWithContent = this.findFirstNodeWithContent(localChild);
            children.push(firstNodeWithContent);
        }
        return { line: this.elementToTLine(element), children };
    }
}
