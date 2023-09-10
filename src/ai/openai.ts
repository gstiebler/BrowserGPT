// This code is for v4 of the openai package: npmjs.com/package/openai
import OpenAI from "openai";

export async function send(apiKey: string, content: string): Promise<OpenAI.Chat.Completions.ChatCompletion> {
    const openai = new OpenAI({ apiKey });
    const response = await openai.chat.completions.create({
        model: "gpt-3.5-turbo",
        messages: [
            {
                role: "user",
                content
            }
        ],
        temperature: 1,
        max_tokens: 256,
        top_p: 1,
        frequency_penalty: 0,
        presence_penalty: 0,
    });
    return response;
}
