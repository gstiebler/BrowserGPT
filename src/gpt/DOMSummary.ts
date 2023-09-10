const { TextEncoder, TextDecoder } = require('text-encoding');

global.TextEncoder = TextEncoder;
global.TextDecoder = TextDecoder;

import _ from "lodash";


// define the type TLine
type TLine = {
    key: string;
    value: any;
}
type TSummaryNode = {
    line: TLine;
    children: TSummaryNode[];
}

export function summarize(document: Document) {
    const extractor = new HtmlExtraction();
    const result = extractor.processTagsRecursive(document.body) as TSummaryNode;
    const summary = printTagsRecursive(result);
    return summary;
}

export function compact(summary: any) {
    const str = JSON.stringify(summary);
    const result = str.replaceAll('"', '');
    return result;
}

function getImmediateTextContent(node: Element): string | null {
    const clonedNode = node.cloneNode(true);
    while (clonedNode.firstChild) {
        clonedNode.removeChild(clonedNode.firstChild);
    }
    return clonedNode.textContent;
}

function printTagsRecursive(node: TSummaryNode) {
    const children = node.children as any[];
    const line = node.line;
    const key = line.key;

    let children_items = children
        .map(printTagsRecursive)
        .filter(Boolean) as any;
    
    if (children_items.length == 1) {
        children_items = children_items[0]
    }

    let value = line.value;

    if (value instanceof String) {
        value = value
            .replaceAll('\n', ' ')
            .replaceAll('  ', ' ')
            .trim();
        // replace multiple spaces with single space
        value = value.split().join();
        const result = [] as any[];
        if (value != '') {
            result.push(value)
        }
        if (!_.isEmpty(children_items)) {
            result.push(children_items)
        }
        if (result.length == 0) {
            return null
        } else if (result.length == 1) {
            return result[0]
        } else {
            return result
        }
    } else {
        if (_.isEmpty(value)) {
            return children_items
        } else {
            if (!_.isEmpty(children_items)) {
                value.children = children_items
            }
            return value
        }
    }
}

class HtmlExtraction {
    key_map = {} as { [key: string]: any };
    id_counter = 0

    name_map = {} as { [key: string]: any };
    name_counter = 0
    forbiddenProps = new Set(["META", "SCRIPT", "STYLE"]);

    input_show_props = new Set(["name", "type", "placeholder", "aria-label", "id", "value"]);
    always_show_tags = new Set(['BUTTON', 'INPUT', 'TEXTAREA', 'SELECT']);

    processTagsRecursive(element: Element): TSummaryNode | TSummaryNode[] {
        const childNodes = [...element.childNodes];
        const html = element.innerHTML;
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
        const text_is_empty = _.isEmpty(directText);
        
        /*
        if (element.getAttribute) {
            const attrs = element.getAttributeNames();
            const attrMap = attrs.reduce((acc, name) => {
                acc[name] = element.getAttribute(name);
                return acc;
            }, {} as { [key: string]: any });
            console.log(attrMap);
        }
        */

        if (element.tagName == 'A') {
            const input_props = {
                type: 'link',
                href: element.getAttribute('href'),
            } as any;
            if (!_.isEmpty(directText)) {
                input_props.text = directText;
            }    

            const line: TLine = { key: 'link', value: input_props };
            return { line, children };
        }
        // define a type with key as string, value as any


        if (this.always_show_tags.has(element.tagName)) {
            // filter input attributes to only show the ones we want
            const attributeNames = element.getAttributeNames();
            const input_props = attributeNames.reduce((acc, name) => {
                if (this.input_show_props.has(name)) {
                    acc[name] = element.getAttribute(name);
                }
                return acc;
            }, {} as { [key: string]: any });


            if (element.getAttribute('type') == 'hidden') {
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
                this.id_counter += 1
                const new_id = `id${this.id_counter}`;
                filteredInputProps.id = new_id;
                this.key_map[new_id] = originalId;
            }

            const original_name = filteredInputProps.name;
            if (original_name) {
                this.name_counter += 1
                const new_name = `name${this.name_counter}`;
                filteredInputProps.name = new_name
                this.name_map[new_name] = original_name
            }

            const line: TLine = { key: element.nodeName, value: filteredInputProps };
            return { line, children };
        }
        const new_line = { key: element.nodeName, value: directText };
        if (text_is_empty && children.length == 0 || children.length == 1) {
            return children;
        } else {
            return { line: new_line, children };
        }
    }
}
