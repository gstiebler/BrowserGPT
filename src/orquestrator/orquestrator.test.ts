import { JSDOM } from "jsdom";
import { commandsSeparatorStr, extractCommands, extractMessageToUser,  } from "../ai/extractCommands";
import { Chat, HTMLDoc, LLM, Orquestrator } from "./orquestrator";
import { compact, summarize } from "../html/DOMSummary";

const promptSource = {
    getMainSystemPromp: () => `
        You are a personal assistant. 
        You have a set of commands available to interact with a browser. 
        You can and should ask clarification questions to the user if necessary, via the command user_question.
        You need to explain your actions, then print the commands between pairs of ${commandsSeparatorStr}.
        You must ask questions to the user if you don't know any information, and wait for the answers before using more commands. 
        After the command open_browser, a browser will be always open, and all commands interact with it.
        You have access to the following commands:
        1. link: Follows the link with the given path. Params: (path: string)
        2. button: Clicks in a button. Params: (id: string)
        3. input: Sets the value of an input. Params (id: string, value: string)
        4. select: Selects/clicks on a radio, select or checkbox. Params (id: string)

        One example of your output may be:
        Search for the best 5 chairs under $500
        ${commandsSeparatorStr}
        open_url("www.google.com")
        ${commandsSeparatorStr}
    `,
};

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

        const sendReceiptUserMsg = "I want to send my massage receipt to Canada Life";
        const openLinkLlmMsg = `Now I'll open the link www.canadalife.com ${commandsSeparatorStr} open_link(www.canadalife.com) ${commandsSeparatorStr}`;
        const userPassCommands = ['set_input_value("id1", "myuser")', 'set_input_value("id2", "mypass")', 'click_submit("id3")'];
        const fillUserPassLlmMsg = `I'll set the user and password ${commandsSeparatorStr} ${userPassCommands.join('\n')} ${commandsSeparatorStr}`;
        const askLoginPasswordLlmMsg = `What's your user name and password?`;
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
            .mockReturnValueOnce(askLoginPasswordLlmMsg);

        await orquestrator.userMessageArrived(sendReceiptUserMsg);
        expect(llmMock.send).nthCalledWith(0, [
            { role: "agent", message: promptSource.getMainSystemPromp() },
            { role: "user", message: sendReceiptUserMsg },
        ]);
        // Orquestrator calls LLM, which returned openLinkLlmMsg
        expect(chatMock.showMessages).nthCalledWith(0, [
            { role: "user", message: sendReceiptUserMsg },
            { role: "system", message: "Now I'll open the link www.canadalife.com" },
        ]);
        expect(htmlDocumentMock.openLink).nthCalledWith(0, "www.canadalife.com");
        await orquestrator.htmlDocumentChanged(new JSDOM(loginPageHtml).window.document);
        expect(llmMock.send).nthCalledWith(1, [
            { role: "agent", message: promptSource.getMainSystemPromp() },
            { role: "user", message: sendReceiptUserMsg },
            { role: "system", message: openLinkLlmMsg },
            { role: "agent", message: `result: ${summarizeHtml(loginPageHtml)}` },
        ]);
        // Orquestrator asks for login and password to the user
        expect(chatMock.showMessages).nthCalledWith(1, [
            { role: "user", message: sendReceiptUserMsg },
            { role: "system", message: "Now I'll read the browser" },
            { role: "system", message: askLoginPasswordLlmMsg },
        ]);
            
        // 2. user sends login and password
        const userPassUserMsg = "myuser mypass";
        await orquestrator.userMessageArrived(userPassUserMsg);
        expect(llmMock.send).nthCalledWith(2, [
            { role: "agent", message: promptSource.getMainSystemPromp() },
            { role: "user", message: sendReceiptUserMsg },
            { role: "system", message: openLinkLlmMsg },               
            { role: "agent", message: `result: ${summarizeHtml(loginPageHtml)}` },
            { role: "user", message: userPassUserMsg },
        ]);
        expect(htmlDocumentMock.setInputValue).nthCalledWith(0, "id1", "myuser");
        expect(htmlDocumentMock.setInputValue).nthCalledWith(1, "id2", "mypass");
        expect(htmlDocumentMock.clickSubmit).nthCalledWith(0, "id3");
        await orquestrator.htmlDocumentChanged(new JSDOM(loginPageHtml).window.document);
        
    });

});
