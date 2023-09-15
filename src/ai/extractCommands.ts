import _ from "lodash";

type Command = {
    name: string;
    params: string[];
};

export function extractCommands(aiMessage: string): Command[] {
    const [userMessage, commandsText] = aiMessage.split('%%%');
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
