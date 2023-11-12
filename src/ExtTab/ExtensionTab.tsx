import React, { useEffect, useState } from 'react';
import { Chat, ChatMessage, LLM, LLMMessage, Orquestrator } from '../orquestrator/orquestrator';
import * as openai from '../ai/openai';
import { extractCommands, extractMessageToUser } from '../ai/extractCommands';
import { promptSource } from '../ai/promptSource';
import { TChatItem } from './types';
import ExtensionMainTab from './ExtensionMainTab';
import { clickButtonMsg, openLinkMsg, reloadHtmlMsg, setInputValueMsg } from '../constants';


async function sendMessageToUserTab(payload: any) {
    return chrome.tabs.query({ active: true, currentWindow: true }, async (tabs) => {
        const currentTab = tabs[0];
        const result = await chrome.tabs.sendMessage(currentTab.id ?? 0, payload);
        console.log(result);
        return result;
    });
}

const htmlDoc = {
    setInputValue: (id: string, value: string) => {
        sendMessageToUserTab({ command: setInputValueMsg, id, value });
    },
    openLink: async (link: string) => {
        const result = await sendMessageToUserTab({ command: openLinkMsg, link });
        console.log(result);
    },
    clickSubmit: (id: string) => {
        sendMessageToUserTab({ command: clickButtonMsg, id });
    },
};

const getOrquestrator = (apiKey: string, chat: Chat): Orquestrator => {
    console.log(`getOrquestrator with apiKey: ${apiKey}`);
    const llm: LLM = {
        send: async (messages: LLMMessage[]): Promise<string> => {
            console.log(`apiKey in send: ${apiKey}`);
            const result = await openai.send(apiKey, messages);
            return result.choices[0].message.content ?? "";

        },
    };
    
    const commandExtractor = { extractCommands, extractMessageToUser };

    const orquestrator = new Orquestrator(llm, htmlDoc, chat, promptSource, commandExtractor);
    return orquestrator;
};

const ExtensionTab: React.FC = () => {
    const [apiKey, setApiKey] = useState(process.env.OPENAI_KEY ?? '');
    const [chatMessage, setChatMessage] = useState(process.env.INITIAL_MESSAGE ?? '');
    const [chatLog, setChatLog] = useState<TChatItem[]>([]);
    const [orquestrator, setOrchestator] = useState<Orquestrator | null>(null);

    useEffect(() => {
        const chat = {
            showMessages: (messages: ChatMessage[]) => {
                setChatLog(messages);
            },
        }
        const orquestrator = getOrquestrator(apiKey, chat);

        chrome.runtime?.onMessage.addListener((msg: any) => {
            if (msg.type === 'htmlDocumentChanged') {
                orquestrator.htmlDocumentChanged(msg.compactHtml);
            }
        });

        setOrchestator(orquestrator);
    }, [apiKey]);

    const handleSendMessage = async () => {
        if (!chatMessage) {
            return;
        }
        orquestrator?.userMessageArrived(chatMessage);
        setChatMessage('');
    };

    return (
        <ExtensionMainTab
          apiKey={apiKey}
          setApiKey={setApiKey}
          chatLog={chatLog}
          chatMessage={chatMessage}
          setChatMessage={setChatMessage}
          handleSendMessage={handleSendMessage}
          reloadHtml={() => sendMessageToUserTab({ command: reloadHtmlMsg })}
        />
    );
};

export default ExtensionTab;
