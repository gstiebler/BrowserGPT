import _ from "lodash";

export function getNonEmptyProperties(obj: any) {
    return Object.entries(obj)
        .filter(([key, value]) => !_.isEmpty(value))
        .reduce((acc, [key, value]) => {
            acc[key] = value;
            return acc;
        }, {} as { [key: string]: any });
}