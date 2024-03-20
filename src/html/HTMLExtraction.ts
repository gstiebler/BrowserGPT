import _ from "lodash";

// define the type TLine
type TLine = {
    element: HTMLElement;
    nodeName: string;
    text?: string;
    props?: { [key: string]: any };
}

export class HtmlExtraction {
    keyMap = new Map<string, HTMLElement>();

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
}