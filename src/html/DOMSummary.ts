import _ from "lodash";
import yaml from 'js-yaml';

// define the type TLine
type TLine = {
    key: string;
    value: any;
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

    let value = line.value;

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
    key_map = {} as { [key: string]: any };
    id_counter = 0

    forbiddenProps = new Set(["META", "SCRIPT", "STYLE"]);

    input_show_props = new Set(["type", "placeholder", "aria-label", "id", "value"]);
    always_show_tags = new Set(['BUTTON', 'INPUT', 'TEXTAREA', 'SELECT']);

    getRealId = (id: string) => this.key_map[id] || id;

    private processLink(element: Element, directText?: string): TLine {
        const input_props = {
            type: 'link',
            href: element.getAttribute('href'),
        } as any;
        if (!_.isEmpty(directText)) {
            input_props.text = directText;
        }

        const line: TLine = { key: 'link', value: input_props };
        return line;
    }

    private addId(originalId: string): string {
        this.id_counter += 1
        const new_id = `id${this.id_counter}`;
        this.key_map[new_id] = originalId;
        return new_id
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
        return _.pick(allInputProps, Array.from(this.input_show_props));
    }

    processTagsRecursive(element: Element): TSummaryNode | TSummaryNode[] {
        const children = [] as TSummaryNode[];
        for (const child of element.childNodes) {
            if (this.forbiddenProps.has((child as Element).tagName)) {
                continue;
            }
            const localChild = this.processTagsRecursive(child as Element);
            if (localChild instanceof Array) {
                children.push(...localChild);
            } else {
                children.push(localChild);
            }
        }

        const directText = getImmediateTextContent(element)?.trim()

        if (element.tagName === 'A') {
            return { line: this.processLink(element, directText), children };
        }
        if (this.always_show_tags.has(element.tagName)) {
            const input_props = this.getFilteredProps(element);

            if (element.getAttribute('type') === 'hidden') {
                return children
            }

            input_props.text = directText;

            if (!input_props.type) {
                input_props.type = element.nodeName;
            }

            // filter props with empty values
            const filteredInputProps = _.pickBy(input_props, (value, key) => !_.isEmpty(value));

            const originalId = filteredInputProps.id;
            if (originalId) {
                filteredInputProps.id = this.addId(originalId);
            }

            const line: TLine = { key: element.nodeName, value: filteredInputProps };
            return { line, children };
        }
        const newLine: TLine = { key: element.nodeName, value: directText };
        const textIsEmpty = _.isEmpty(directText);
        if ((textIsEmpty && children.length === 0) || (children.length === 1)) {
            return children;
        } else {
            return { line: newLine, children };
        }
    }
}
