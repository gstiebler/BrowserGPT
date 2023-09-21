// This code is for v4 of the openai package: npmjs.com/package/openai
import OpenAI from "openai";
import { ChatCompletionMessageParam } from "openai/resources/chat";
import { LLMMessage } from "../orquestrator/orquestrator";

export async function send(apiKey: string, messagesLlm: LLMMessage[]): Promise<OpenAI.Chat.Completions.ChatCompletion> {
    const openai = new OpenAI({ apiKey, dangerouslyAllowBrowser: true });

    const messages: ChatCompletionMessageParam[] = messagesLlm.map(message => ({
        role: message.role,
        content: message.message,
    }));
    const response = await openai.chat.completions.create({
        model: "gpt-3.5-turbo",
        messages,
        temperature: 1,
        max_tokens: 256,
        top_p: 1,
        frequency_penalty: 0,
        presence_penalty: 0,
    });
    return response;
}
