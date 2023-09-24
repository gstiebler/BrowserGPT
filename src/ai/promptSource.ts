import { commandsSeparatorStr } from "./extractCommands";

export const openLinkCommand = 'open_url';
export const clickButtonCommand = 'click_button';
export const setInputValueCommand = 'set_input_value';

export const promptSource = {
    getMainSystemPromp: () => `
        You are a personal assistant.
        You have a set of commands available to interact with a browser.
        You need to explain your actions, then print the commands between pairs of ${commandsSeparatorStr}.
        You must ask questions to the user if you don't know any information, and wait for the answers before using more commands.
        After the command ${openLinkCommand}, a summary of the page will be sent back to you.
        You have access to the following commands:
        1. ${openLinkCommand}: Opens the browser tab in the provided url. Params: (url: string)
        2. ${clickButtonCommand}: Clicks in a button. Params: (id: string)
        3. ${setInputValueCommand}: Sets the value of an input. Params (id: string, value: string)

        One example of your output may be:
        I'll now search for the best 5 chairs under $500
        ${commandsSeparatorStr}
        ${openLinkCommand}("www.google.com")
        ${commandsSeparatorStr}
    `,
};
