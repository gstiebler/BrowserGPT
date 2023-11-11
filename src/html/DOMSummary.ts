import _ from "lodash";
import yaml from 'js-yaml';

// define the type TLine
type TLine = {
    key: string;
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

function getImmediateTextContent(node: Element): string | null {
    const clonedNode = node.cloneNode(true);
    while (clonedNode.firstChild) {
        clonedNode.removeChild(clonedNode.firstChild);
    }
    return clonedNode.textContent;
}

function printTagsRecursive(node: TSummaryNode) {
    const children = node.children as TSummaryNode[];
    const line = node.line;

    let children_items = children
        .map(printTagsRecursive)
        .filter(Boolean) as any;

    if (children_items.length === 1) {
        children_items = children_items[0]
    }

    let value = '';//line.value;

    if (value instanceof String) {
        value = value
            .replaceAll('\n', ' ')
            .replaceAll('  ', ' ')
            .trim();
        // replace multiple spaces with single space
        value = value.split(' ').join();
        const result = [] as any[];
        if (value !== '') {
            result.push(value)
        }
        if (!_.isEmpty(children_items)) {
            result.push(children_items)
        }
        if (result.length === 0) {
            return null
        } else if (result.length === 1) {
            return result[0]
        } else {
            return result
        }
    } else {
        if (_.isEmpty(value)) {
            return children_items
        } else {
            if (!_.isEmpty(children_items)) {
                if (!value) {
                    throw new Error('value is empty');
                }
                value.children = children_items
            }
            return value
        }
    }
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

        return { key: 'link', text: directText, props: inputProps };
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

        return { key: element.nodeName, text: directText, props: this.getProps(element) };
    }

    processTagsRecursive(element: Element): TSummaryNode {
        const children = [] as TSummaryNode[];
        for (const child of element.childNodes) {
            if (this.filterElement(child as Element)) {
                continue;
            }
            const localChild = this.processTagsRecursive(child as Element);
            children.push(localChild);
        }
        return { line: this.elementToTLine(element), children };
    }
}
