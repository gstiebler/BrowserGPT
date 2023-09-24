import OpenAI from "openai";
import { ChatCompletionMessageParam } from "openai/resources/chat";
import { LLMMessage } from "../orquestrator/orquestrator";
import { backOff } from "exponential-backoff";
import _ from "lodash";


async function sendInternal(apiKey: string, messagesLlm: LLMMessage[]): Promise<OpenAI.Chat.Completions.ChatCompletion> {
    const openai = new OpenAI({ apiKey, dangerouslyAllowBrowser: true });

    const messages: ChatCompletionMessageParam[] = messagesLlm.map(message => ({
        role: message.role,
        content: message.message,
    }));

    const gpt4Model = "gpt-4-0613";
    const gpt3Model = "gpt-3.5-turbo-0613";
    const response = await openai.chat.completions.create({
        model: gpt4Model,
        messages,
        temperature: 1,
        max_tokens: 256,
        top_p: 1,
        frequency_penalty: 0,
        presence_penalty: 0,
    });
    return response;
}

export function send(apiKey: string, messagesLlm: LLMMessage[]): Promise<OpenAI.Chat.Completions.ChatCompletion> {
    if (_.isEmpty(apiKey)) {
        throw new Error('No OpenAI API key provided: ' + apiKey);
    }
    return backOff(() => sendInternal(apiKey, messagesLlm),
        { retry: (e: any, attempNumber: number) => { console.log(`Error sending message to OpenAI: ${e}`); return true; } }
    );
}
