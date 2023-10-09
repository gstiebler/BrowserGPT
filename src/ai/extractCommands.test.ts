import { commandsSeparatorStr, extractCommands } from "./extractCommands";

describe("extract command", () => {
    it("happy path", () => {
        const aiMessage = `
            Hello, this is the user message
            second line
            ${commandsSeparatorStr}
                command1() // comment
                command2("param1, param2") 
            ${commandsSeparatorStr}
            other text
        `
        const result = extractCommands(aiMessage);
        expect(result).toEqual([
            { name: 'command1', params: [] },
            { name: 'command2', params: ['param1', 'param2'] },
        ]);
    });
});
