import { Command } from "../ai/extractCommands";
import { compact, summarize } from "../html/DOMSummary";

export type LLMMessage = {
    role: 'system' | 'agent' | 'user';
    message: string;
};

export interface LLM {
    send(messages: LLMMessage[]): string;
}

export interface HTMLDoc {
    setInputValue(id: string, value: string): void;
    openLink(link: string): void;
    clickSubmit(id: string): void;
    selectOption(id: string, value: string): void;
}

export type ChatMessage = {
    role: 'system' | 'user';
    message: string;
};

export interface Chat {
    showMessages(messages: ChatMessage[]): void;
}

export interface PromptSource {
    getMainSystemPromp(): string;
}

export interface CommandExtractor {
    extractCommands(llmMessage: string): Command[];
    extractMessageToUser(llmMessage: string): string;
}

export class Orquestrator {

    llmMessagesHistory = [
        { role: 'agent', message: this.promptSource.getMainSystemPromp() }
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
        this.getAndExecuteCommands();
    }

    async htmlDocumentChanged(document: Document) {
        const summary = summarize(document);
        const compactSummary = compact(summary);
        this.llmMessagesHistory = [
            ...this.llmMessagesHistory,
            { role: 'agent', message: `result: ${compactSummary}` },
        ]

        this.getAndExecuteCommands();
    }

    private async getAndExecuteCommands() {
        const result1 = await this.llm.send(this.llmMessagesHistory);
        this.llmMessagesHistory = [
            ...this.llmMessagesHistory,
            { role: 'system', message: result1 },
        ]
        const commands = this.commandExtractor.extractCommands(result1);
        const msgToUser = this.commandExtractor.extractMessageToUser(result1);
        this.userMessagesHistory.push({ role: 'system', message: msgToUser });
        this.chat.showMessages(this.userMessagesHistory);
        this.executeCommands(commands);
    }

    private async executeCommands(commands: Command[]) {
        for (const command of commands) {
            const commandsFunctions = {
                'set_input_value': this.htmlDocument.setInputValue,
                'open_link': this.htmlDocument.openLink,
                'click_submit': this.htmlDocument.clickSubmit,
                'select_option': this.htmlDocument.selectOption,
            } as { [key: string]: Function };
            
            const commandFn = commandsFunctions[command.name];
            commandFn(...command.params);
        }
    }

}
