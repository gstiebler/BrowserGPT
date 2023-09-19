import { commandsSeparatorStr, extractCommands, extractMessageToUser,  } from "../ai/extractCommands";
import { Chat, HTMLDoc, LLM, Orquestrator } from "./orquestrator";

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

describe("orquestrator", () => {

    let llmMock: LLM;
    let htmlDocumentMock: HTMLDoc;
    let chatMock: Chat;
    const commandExtractor = { extractCommands, extractMessageToUser };

    beforeEach(() => {
        llmMock = { send: jest.fn() };
        htmlDocumentMock = {
            setInputValue: jest.fn(),
            followLink: jest.fn(),
            clickButton: jest.fn(),
            selectOption: jest.fn(),
            readBrowser: jest.fn(),
        }; 
    });

    it("happy path", async () => {
        const orquestrator = new Orquestrator(llmMock, htmlDocumentMock, chatMock, promptSource, commandExtractor);

        // 1. user sends initial prompt
        {
            const firstUserMessage = "I want to send my massage receipt to Canada Life";
            const firstLLMResult = `Now I'll read the browser ${commandsSeparatorStr} read_browser() ${commandsSeparatorStr}`;
            const firstHtml = `
                <html>
                    <body>
                        Enter your user name
                        <input id="id1"/>
                        Enter your password
                        <input id="id2"/>
                    </body>
                </html>
            `;
            const secondLLMResult = `Now I'll read the browser ${commandsSeparatorStr} read_browser() ${commandsSeparatorStr}`;

            llmMock.send = jest.fn()
                .mockReturnValueOnce(firstLLMResult)
                .mockReturnValueOnce(secondLLMResult);

            htmlDocumentMock.readBrowser = jest.fn().mockReturnValueOnce(firstHtml);
    
            await orquestrator.userMessageArrived(firstUserMessage);
            expect(llmMock.send).nthCalledWith(0, [
                { role: "agent", message: promptSource.getMainSystemPromp() },
                { role: "user", message: firstUserMessage },
            ]);
            expect(llmMock.send).nthCalledWith(1, [
                { role: "agent", message: promptSource.getMainSystemPromp() },
                { role: "user", message: firstUserMessage },
                { role: "agent", message: `result: ${firstHtml}` },
            ]);
        }
       
        
    });

});
