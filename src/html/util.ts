import _ from "lodash";

export const forbiddenTypes = new Set(["meta", "script", "style", "#comment"]);
export const usefulTypes = new Set(["input", "textarea", "select", "button"]);

export const usefulAttributes = new Set(["text", "value", "title", "placeholder"]);
export const interestingProps = new Set(["role", "type", "placeholder", "value", "href", "title", "id"]);
const interestingAriaProps = new Set(["aria-label", "aria-labelledby", "aria-describedby", "aria-details", "aria-placeholder", "aria-roledescription", "aria-valuetext"]);

export const isInterestingAriaProp = (key: string) => interestingAriaProps.has(key);

export function getNonEmptyProperties(obj: any) {
    return Object.entries(obj)
        .filter(([key, value]) => !_.isEmpty(value))
        .reduce((acc, [key, value]) => {
            acc[key] = value;
            return acc;
        }, {} as { [key: string]: any });
}