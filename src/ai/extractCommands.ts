import _ from "lodash";

export type Command = {
    name: string;
    params: string[];
};

export const commandsSeparatorStr = '%%%';

export function extractCommands(aiMessage: string): Command[] {
    const [userMessage, commandsText] = aiMessage.split(commandsSeparatorStr);
    if (_.isEmpty(commandsText)) {
        return [];
    }
    const commandLines = commandsText.
        split('\n')
        .map(s => s.trim())
        .filter(Boolean);
    const commands = commandLines.map(line => {
        const beforeLastParen = line.split(')')[0];
        const [name, ...params] = beforeLastParen
            .split(/[\(\)\,)]+/)
            .map(s => s.trim().replaceAll('"', '').replaceAll("'", ''))
            .filter(Boolean);
        return { name, params };
    });
    return commands;
}
