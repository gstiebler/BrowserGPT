import { JSDOM } from "jsdom";
import { commandsSeparatorStr, extractCommands, extractMessageToUser,  } from "../ai/extractCommands";
import { Chat, HTMLDoc, LLM, Orquestrator } from "./orquestrator";
import { summarize } from "../html/DOMSummary";
import { promptSource } from "../ai/promptSource";

function summarizeHtml(html: string): string {
    const loginPageDocument = new JSDOM(html).window.document;
    const { summary, extractor } = summarize(loginPageDocument);
    return summary;
}

describe("orquestrator", () => {

    let llmMock: LLM;
    let htmlDocumentMock: HTMLDoc;
    let chatMock: Chat;
    const commandExtractor = { extractCommands, extractMessageToUser };

    beforeEach(() => {
        llmMock = { send: jest.fn() };
        htmlDocumentMock = {
            setInputValue: jest.fn(),
            openLink: jest.fn(),
            clickSubmit: jest.fn(),
        };
        chatMock = { showMessages: jest.fn() };
    });

    it("happy path", async () => {
        const orquestrator = new Orquestrator(llmMock, htmlDocumentMock, chatMock, promptSource, commandExtractor);

        const openLinkLlmMsg = `Now I'll open the link www.canadalife.com ${commandsSeparatorStr} open_url(www.canadalife.com) ${commandsSeparatorStr}`;
        const askLoginPasswordLlmMsg = `What's your user name and password?`;
        const userPassCommands = ['set_input_value("id1", "myuser")', 'set_input_value("id2", "mypass")', 'click_button("id3")'];
        const fillUserPassLlmMsg = `I'll set the user and password ${commandsSeparatorStr} ${userPassCommands.join('\n')} ${commandsSeparatorStr}`;
        const openClainLlmMsg = `Now I'll open the link /make_a_claim ${commandsSeparatorStr} open_url(/make_a_claim) ${commandsSeparatorStr}`;

        const sendReceiptUserMsg = "I want to send my massage receipt to Canada Life";
        const loginPageHtml = `
            <html>
                <body>
                    Enter your user name
                    <input id="id1"/>
                    Enter your password
                    <input id="id2"/>
                    <input id="id3" type="submit", value="Sign in"/>
                </body>
            </html>
        `;

        // 1. user sends initial prompt
        llmMock.send = jest.fn()
            .mockReturnValueOnce(openLinkLlmMsg)
            .mockReturnValueOnce(askLoginPasswordLlmMsg)
            .mockReturnValueOnce(fillUserPassLlmMsg)
            .mockReturnValueOnce(openClainLlmMsg);

        await orquestrator.userMessageArrived(sendReceiptUserMsg);
        // Orquestrator calls LLM, which returned openLinkLlmMsg
        // Orquestrator shows the new LLM message to the user
        // Orquestrator calls htmlDocument.openLink
        expect(llmMock.send).nthCalledWith(1, [
            { role: "system", message: promptSource.getMainSystemPrompt() },
            { role: "user", message: sendReceiptUserMsg },
        ]);
        expect(chatMock.showMessages).nthCalledWith(2, [
            { role: "user", message: sendReceiptUserMsg },
            { role: "assistant", message: "Now I'll open the link www.canadalife.com" },
        ]);
        expect(htmlDocumentMock.openLink).nthCalledWith(1, "www.canadalife.com");

        const loginPageSummary = summarizeHtml(loginPageHtml);
        await orquestrator.htmlDocumentChanged(loginPageSummary);
        // Orquestrator calls LLM, which returned askLoginPasswordLlmMsg
        // Orquestrator asks for login and password to the user
        expect(llmMock.send).nthCalledWith(2, [
            { role: "system", message: promptSource.getMainSystemPrompt() },
            { role: "user", message: sendReceiptUserMsg },
            { role: "assistant", message: openLinkLlmMsg },
            { role: "system", message: `Compacted HTML result: ${loginPageSummary}` },
        ]);
        expect(chatMock.showMessages).nthCalledWith(3, [
            { role: "user", message: sendReceiptUserMsg },
            { role: "assistant", message: "Now I'll open the link www.canadalife.com" },
            { role: "assistant", message: askLoginPasswordLlmMsg },
        ]);
            
        // 2. user sends login and password
        const userPassUserMsg = "myuser mypass";
        await orquestrator.userMessageArrived(userPassUserMsg);
        // Orquestrator calls LLM, which returned fillUserPassLlmMsg
        // Orquestrator shows the new LLM message to the user
        // Orquestrator calls htmlDocument.setInputValue and htmlDocument.clickSubmit
        expect(llmMock.send).nthCalledWith(3, [
            { role: "system", message: promptSource.getMainSystemPrompt() },
            { role: "user", message: sendReceiptUserMsg },
            { role: "assistant", message: openLinkLlmMsg }, 
            { role: "system", message: `result: ${summarizeHtml(loginPageHtml)}` },
            { role: "assistant", message: askLoginPasswordLlmMsg }, 
            { role: "user", message: userPassUserMsg },
        ]);
        expect(chatMock.showMessages).nthCalledWith(4, [
            { role: "user", message: sendReceiptUserMsg },
            { role: "assistant", message: "Now I'll open the link www.canadalife.com" },
            { role: "assistant", message: askLoginPasswordLlmMsg },
            { role: "user", message: userPassUserMsg },
        ]);
        expect(chatMock.showMessages).nthCalledWith(5, [
            { role: "user", message: sendReceiptUserMsg },
            { role: "assistant", message: "Now I'll open the link www.canadalife.com" },
            { role: "assistant", message: askLoginPasswordLlmMsg },
            { role: "user", message: userPassUserMsg },
            { role: "assistant", message: "I'll set the user and password" },
        ]);
        expect(htmlDocumentMock.setInputValue).nthCalledWith(1, "id1", "myuser");
        expect(htmlDocumentMock.setInputValue).nthCalledWith(2, "id2", "mypass");
        expect(htmlDocumentMock.clickSubmit).nthCalledWith(1, "id3");

        const initialPageHtml = `
            <html>
                <body>
                    <a href="/make_a_claim">Make a Claim</a>
                </body>
            </html>
        `;

        const initialPageSummary = summarizeHtml(initialPageHtml);
        await orquestrator.htmlDocumentChanged(initialPageSummary);
        // Orquestrator calls LLM, which returned open_link(/make_a_claim)
        // Orquestrator shows the new LLM message to the user
        // Orquestrator calls htmlDocument.openLink
        expect(llmMock.send).nthCalledWith(4, [
            { role: "system", message: promptSource.getMainSystemPrompt() },
            { role: "user", message: sendReceiptUserMsg },
            { role: "assistant", message: openLinkLlmMsg }, 
            { role: "system", message: `result: ${summarizeHtml(loginPageHtml)}` },
            { role: "assistant", message: askLoginPasswordLlmMsg }, 
            { role: "user", message: userPassUserMsg },
            { role: "assistant", message: fillUserPassLlmMsg },  
            { role: "system", message: `result: ${initialPageSummary}` },
        ]);
        expect(chatMock.showMessages).nthCalledWith(6, [
            { role: "user", message: sendReceiptUserMsg },
            { role: "assistant", message: "Now I'll open the link www.canadalife.com" },
            { role: "assistant", message: askLoginPasswordLlmMsg },
            { role: "user", message: userPassUserMsg },
            { role: "assistant", message: "I'll set the user and password" },
            { role: "assistant", message: "Now I'll open the link /make_a_claim" },
            
        ]);
        expect(htmlDocumentMock.openLink).nthCalledWith(2, "/make_a_claim");
    });

});
