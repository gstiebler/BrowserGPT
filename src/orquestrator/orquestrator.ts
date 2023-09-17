import { Command } from "../ai/extractCommands";

export type LLMMessage = {
    role: 'system' | 'agent' | 'user';
    message: string;
};

export interface LLM {
    send(messages: LLMMessage[]): void;
}

export interface HTMLDoc {
    setInputValue(id: string, value: string): void;
    followLink(link: string): void;
    clickButton(id: string): void;
    selectOption(id: string, value: string): void;
    readBrowser(): string;
}

export type ChatMessage = {
    role: 'agent' | 'user';
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
}

export class Orquestrator {

    constructor(
        private llm: LLM, 
        private htmlDocument: HTMLDoc, 
        private chat: Chat,
        private promptSource: PromptSource,
        private commandExtractor: CommandExtractor
    ) { }

    async userMessageArrived(userMessage: string) {
        const result = await this.llm.send([
            { role: 'system', message: userMessage },
        ]);
    }

}
