const { TextEncoder, TextDecoder } = require('text-encoding');

global.TextEncoder = TextEncoder;
global.TextDecoder = TextDecoder;

import _ from "lodash";
import { text } from "stream/consumers";

export function summarize(document: Document): any {
    const extractor = new HtmlExtraction();
    const result = extractor.processTagsRecursive(document.body);
    return result;
}

function getImmediateTextContent(node: Element): string | null {
    const clonedNode = node.cloneNode(true);
    while (clonedNode.firstChild) {
        clonedNode.removeChild(clonedNode.firstChild);
    }
    return clonedNode.textContent;
}


class HtmlExtraction {
    key_map = {} as { [key: string]: any };
    id_counter = 0

    name_map = {} as { [key: string]: any };
    name_counter = 0
    forbiddenProps = new Set(["META", "SCRIPT", "STYLE"]);

    input_show_props = new Set(["name", "type", "placeholder", "aria-label", "id", "value"]);
    always_show_tags = new Set(['BUTTON', 'INPUT', 'TEXTAREA', 'SELECT']);

    processTagsRecursive(element: Element) {
        const childNodes = [...element.childNodes];
        const html = element.innerHTML;
        const children = [] as any[];
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

        const directText = getImmediateTextContent(element)?.trim();
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
                text: directText,
                type: 'link',
                href: element.getAttribute('href'),
            }

            const line = { key: 'link', value: input_props };
            return { line: line, "children": children };
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

            input_props['text'] = directText;

            if (!input_props['type']) {
                input_props['type'] = element.nodeName;
            }

            // filter props with empty values
            const filteredInputProps = _.pickBy(input_props, (value, key) => !_.isEmpty(value));

            const originalId = filteredInputProps['id'];
            if (originalId) {
                this.id_counter += 1
                const new_id = `id${this.id_counter}`;
                filteredInputProps['id'] = new_id;
                this.key_map[new_id] = originalId;
            }

            const original_name = filteredInputProps['name'];
            if (original_name) {
                this.name_counter += 1
                const new_name = `name${this.name_counter}`;
                filteredInputProps['name'] = new_name
                this.name_map[new_name] = original_name
            }

            const line = { key: element.nodeName, value: filteredInputProps };
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
