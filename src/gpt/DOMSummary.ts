const { TextEncoder, TextDecoder } = require('text-encoding');

global.TextEncoder = TextEncoder;
global.TextDecoder = TextDecoder;

import _ from "lodash";

export function summarize(document: Document): any {
    const extractor = new HtmlExtraction();
    const result = extractor.processTagsRecursive(document.body);
    return result;
}


class HtmlExtraction {
    key_map = {} as { [key: string]: any };
    id_counter = 0

    name_map = {} as { [key: string]: any };
    name_counter = 0
    forbiddenProps = new Set(["meta", "script", "style"]);

    input_show_props = new Set(["name", "type", "placeholder", "aria-label", "id", "value"]);
    always_show_tags = new Set(['button', 'input', 'textarea', 'select']);

    processTagsRecursive(element: Element) {
        if (element.nodeName in this.forbiddenProps) {
            return null;
        }

        const children = [] as any[];
        for (const child of element.childNodes) {
            const localChild = this.processTagsRecursive(child as Element);
            children.push(localChild);
        }

        const directText = element.textContent;

        if (element.nodeName == 'a') {
            const input_props = {
                text: directText,
                type: 'link',
                href: element.getAttribute('href'),
            }

            const line = { key: 'link', value: input_props };
            return { line: line, "children": children };
        }
        // define a type with key as string, value as any


        if (element.nodeName in this.always_show_tags) {
            // filter input attributes to only show the ones we want
            const attributeNames = element.getAttributeNames();
            const input_props = attributeNames.reduce((acc, name) => {
                if (name in this.input_show_props) {
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

            const originalId = filteredInputProps.get('id');
            if (originalId) {
                this.id_counter += 1
                const new_id = `id${this.id_counter}`;
                filteredInputProps['id'] = new_id;
                this.key_map[new_id] = originalId;
            }

            const original_name = filteredInputProps.get('name')
            if (original_name) {
                this.name_counter += 1
                const new_name = `name${this.name_counter}`;
                input_props['name'] = new_name
                this.name_map[new_name] = original_name
            }

            const line = { key: element.nodeName, value: input_props };
            return { line, children };
        }
        const text_is_empty = directText?.trim() == '';
        const new_line = { key: element.nodeName, value: directText };;
        if (text_is_empty && children.length == 0 || children.length == 1){
            return children;
        } else {
            return { line: new_line, children };
        }
    }
}
        