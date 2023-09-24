import OpenAI from "openai";
import { ChatCompletionMessageParam } from "openai/resources/chat";
import { LLMMessage } from "../orquestrator/orquestrator";

export async function send(apiKey: string, messagesLlm: LLMMessage[]): Promise<OpenAI.Chat.Completions.ChatCompletion> {
    const openai = new OpenAI({ apiKey, dangerouslyAllowBrowser: true });

    const messages: ChatCompletionMessageParam[] = messagesLlm.map(message => ({
        role: message.role,
        content: message.message,
    }));

    const gpt4Model = "gpt-4-0613";
    const gpt3Model = "gpt-3.5-turbo-0613";

    let retryCount = 0;
    const maxRetries = 3; // Set maximum number of retries

    while (true) {
        try {
            const response = await openai.chat.completions.create({
                model: gpt3Model,
                messages,
                temperature: 1,
                max_tokens: 256,
                top_p: 1,
                frequency_penalty: 0,
                presence_penalty: 0,
            });
            return response;
        } catch (error: any) {
            if (error.error?.code === "rate_limit_exceeded" && retryCount < maxRetries) {
                retryCount++;
                console.log("Rate limit exceeded. Retrying in 1 second...");
                await new Promise(resolve => setTimeout(resolve, 1000));
            } else {
                console.error("Failed to make the request: ", error);
                throw error;
            }
        }
    }
}
