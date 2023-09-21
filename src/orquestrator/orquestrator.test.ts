import { JSDOM } from "jsdom";
import { commandsSeparatorStr, extractCommands, extractMessageToUser,  } from "../ai/extractCommands";
import { Chat, HTMLDoc, LLM, Orquestrator } from "./orquestrator";
import { compact, summarize } from "../html/DOMSummary";
import { promptSource } from "../ai/promptSource";

function summarizeHtml(html: string): string {
    const loginPageDocument = new JSDOM(html).window.document;
    const summary = summarize(loginPageDocument);
    return compact(summary);
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
            selectOption: jest.fn(),
        };
        chatMock = { showMessages: jest.fn() };
    });

    it("happy path", async () => {
        const orquestrator = new Orquestrator(llmMock, htmlDocumentMock, chatMock, promptSource, commandExtractor);

        const openLinkLlmMsg = `Now I'll open the link www.canadalife.com ${commandsSeparatorStr} open_link(www.canadalife.com) ${commandsSeparatorStr}`;
        const askLoginPasswordLlmMsg = `What's your user name and password?`;
        const userPassCommands = ['set_input_value("id1", "myuser")', 'set_input_value("id2", "mypass")', 'click_submit("id3")'];
        const fillUserPassLlmMsg = `I'll set the user and password ${commandsSeparatorStr} ${userPassCommands.join('\n')} ${commandsSeparatorStr}`;
        const openClainLlmMsg = `Now I'll open the link /make_a_claim ${commandsSeparatorStr} open_link(/make_a_claim) ${commandsSeparatorStr}`;

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
            { role: "assistant", message: promptSource.getMainSystemPromp() },
            { role: "user", message: sendReceiptUserMsg },
        ]);
        expect(chatMock.showMessages).nthCalledWith(1, [
            { role: "user", message: sendReceiptUserMsg },
            { role: "system", message: "Now I'll open the link www.canadalife.com" },
        ]);
        expect(htmlDocumentMock.openLink).nthCalledWith(1, "www.canadalife.com");

        await orquestrator.htmlDocumentChanged(new JSDOM(loginPageHtml).window.document);
        // Orquestrator calls LLM, which returned askLoginPasswordLlmMsg
        // Orquestrator asks for login and password to the user
        expect(llmMock.send).nthCalledWith(2, [
            { role: "assistant", message: promptSource.getMainSystemPromp() },
            { role: "user", message: sendReceiptUserMsg },
            { role: "system", message: openLinkLlmMsg },
            { role: "assistant", message: `result: ${summarizeHtml(loginPageHtml)}` },
        ]);
        expect(chatMock.showMessages).nthCalledWith(2, [
            { role: "user", message: sendReceiptUserMsg },
            { role: "system", message: "Now I'll open the link www.canadalife.com" },
            { role: "system", message: askLoginPasswordLlmMsg },
        ]);
            
        // 2. user sends login and password
        const userPassUserMsg = "myuser mypass";
        await orquestrator.userMessageArrived(userPassUserMsg);
        // Orquestrator calls LLM, which returned fillUserPassLlmMsg
        // Orquestrator shows the new LLM message to the user
        // Orquestrator calls htmlDocument.setInputValue and htmlDocument.clickSubmit
        expect(llmMock.send).nthCalledWith(3, [
            { role: "assistant", message: promptSource.getMainSystemPromp() },
            { role: "user", message: sendReceiptUserMsg },
            { role: "system", message: openLinkLlmMsg }, 
            { role: "assistant", message: `result: ${summarizeHtml(loginPageHtml)}` },
            { role: "system", message: askLoginPasswordLlmMsg }, 
            { role: "user", message: userPassUserMsg },
        ]);
        expect(chatMock.showMessages).nthCalledWith(3, [
            { role: "user", message: sendReceiptUserMsg },
            { role: "system", message: "Now I'll open the link www.canadalife.com" },
            { role: "system", message: askLoginPasswordLlmMsg },
            { role: "user", message: userPassUserMsg },
            { role: "system", message: "I'll set the user and password" },
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
        await orquestrator.htmlDocumentChanged(new JSDOM(initialPageHtml).window.document);
        // Orquestrator calls LLM, which returned open_link(/make_a_claim)
        // Orquestrator shows the new LLM message to the user
        // Orquestrator calls htmlDocument.openLink
        expect(llmMock.send).nthCalledWith(4, [
            { role: "assistant", message: promptSource.getMainSystemPromp() },
            { role: "user", message: sendReceiptUserMsg },
            { role: "system", message: openLinkLlmMsg }, 
            { role: "assistant", message: `result: ${summarizeHtml(loginPageHtml)}` },
            { role: "system", message: askLoginPasswordLlmMsg }, 
            { role: "user", message: userPassUserMsg },
            { role: "system", message: fillUserPassLlmMsg },  
            { role: "assistant", message: `result: ${summarizeHtml(initialPageHtml)}` },
        ]);
        expect(chatMock.showMessages).nthCalledWith(4, [
            { role: "user", message: sendReceiptUserMsg },
            { role: "system", message: "Now I'll open the link www.canadalife.com" },
            { role: "system", message: askLoginPasswordLlmMsg },
            { role: "user", message: userPassUserMsg },
            { role: "system", message: "I'll set the user and password" },
            { role: "system", message: "Now I'll open the link /make_a_claim" },
            
        ]);
        expect(htmlDocumentMock.openLink).nthCalledWith(2, "/make_a_claim");
    });

});
