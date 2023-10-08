import { Command } from "../ai/extractCommands";
import { clickButtonCommand, openLinkCommand, setInputValueCommand } from "../ai/promptSource";

export type LLMMessage = {
    role: 'system' | 'assistant' | 'user';
    message: string;
};

export interface LLM {
    send(messages: LLMMessage[]): Promise<string>;
}

export interface HTMLDoc {
    setInputValue(id: string, value: string): void;
    openLink(link: string): void;
    clickSubmit(id: string): void;
}

export type ChatMessage = {
    role: 'assistant' | 'user';
    message: string;
};

export interface Chat {
    showMessages(messages: ChatMessage[]): void;
}

export interface PromptSource {
    getMainSystemPrompt(): string;
}

export interface CommandExtractor {
    extractCommands(llmMessage: string): Command[];
    extractMessageToUser(llmMessage: string): string;
}

export class Orquestrator {

    llmMessagesHistory = [
        { role: 'assistant', message: this.promptSource.getMainSystemPrompt() }
    ] as LLMMessage[];

    userMessagesHistory = [] as ChatMessage[];

    constructor(
        private llm: LLM, 
        private htmlDocument: HTMLDoc, 
        private chat: Chat,
        private promptSource: PromptSource,
        private commandExtractor: CommandExtractor
    ) { }

    async userMessageArrived(userMessage: string) {
        this.llmMessagesHistory = [
            ...this.llmMessagesHistory,
            { role: 'user', message: userMessage },
        ]
        this.userMessagesHistory.push({ role: 'user', message: userMessage });
        this.chat.showMessages(this.userMessagesHistory);
        await this.getAndExecuteCommands();
    }

    async htmlDocumentChanged(compactHtmlSummary: string) {
        this.llmMessagesHistory = [
            ...this.llmMessagesHistory,
            { role: 'assistant', message: `result: ${compactHtmlSummary}` },
        ]

        this.getAndExecuteCommands();
    }

    private async getAndExecuteCommands() {
        console.log('Sending the following messages to LLM:');
        console.log(this.llmMessagesHistory);
        const result1 = await this.llm.send(this.llmMessagesHistory);
        console.log(`Received the following message from LLM: ${result1}`);
        this.llmMessagesHistory = [
            ...this.llmMessagesHistory,
            { role: 'assistant', message: result1 },
        ]
        const commands = this.commandExtractor.extractCommands(result1);
        const msgToUser = this.commandExtractor.extractMessageToUser(result1);
        this.userMessagesHistory = [...this.userMessagesHistory, { role: 'assistant', message: msgToUser }];
        this.chat.showMessages(this.userMessagesHistory);
        this.executeCommands(commands);
    }

    private async executeCommands(commands: Command[]) {
        for (const command of commands) {
            console.log(`command: ${JSON.stringify(command)}`);
            const commandsFunctions = {
                [setInputValueCommand]: this.htmlDocument.setInputValue,
                [openLinkCommand]: this.htmlDocument.openLink,
                [clickButtonCommand]: this.htmlDocument.clickSubmit,
            } as { [key: string]: Function };
            const commandFn = commandsFunctions[command.name];
            if (!commandFn) {
                console.error(`Command ${command.name} not found`);
                continue;
            }
            commandFn(...command.params);
        }
    }

}
