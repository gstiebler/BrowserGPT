import React, { useEffect, useState } from 'react';
import { Chat, ChatMessage, LLM, LLMMessage, Orquestrator } from '../orquestrator/orquestrator';
import * as openai from '../ai/openai';
import { extractCommands, extractMessageToUser } from '../ai/extractCommands';
import { promptSource } from '../ai/promptSource';
import { TChatItem } from './types';
import ExtensionMainTab from './ExtensionMainTab';


async function sendMessageToUserTab(payload: any) {
    return chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
        const currentTab = tabs[0];
        const result = chrome.tabs.sendMessage(currentTab.id ?? 0, payload);
        console.log(result);
        return result;
    });
}

const htmlDoc = {
    setInputValue: (id: string, value: string) => {
        sendMessageToUserTab({ command: 'setInputValue', id, value });
    },
    openLink: async (link: string) => {
        const result = await sendMessageToUserTab({ command: 'openLink', link });
        console.log(result);
    },
    clickSubmit: (id: string) => {
        sendMessageToUserTab({ command: 'clickSubmit', id });
    },
};

const getOrquestrator = (apiKey: string, chat: Chat): Orquestrator => {
    const llm: LLM = {
        send: async (messages: LLMMessage[]): Promise<string> => {
            const result = await openai.send(apiKey, messages);
            return result.choices[0].message.content ?? "";

        },
    };
    
    const commandExtractor = { extractCommands, extractMessageToUser };

    const orquestrator = new Orquestrator(llm, htmlDoc, chat, promptSource, commandExtractor);
    return orquestrator;
};

const ExtensionTab: React.FC = () => {
    const [apiKey, setApiKey] = useState('');
    const [chatMessage, setChatMessage] = useState('');
    const [chatLog, setChatLog] = useState<TChatItem[]>([]);
    const [orquestrator, setOrchestator] = useState<Orquestrator | null>(null);

    useEffect(() => {
        const chat = {
            showMessages: (messages: ChatMessage[]) => {
                setChatLog(messages);
                console.log(`showMessages: ${JSON.stringify(messages)}`);
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
        />
    );
};

export default ExtensionTab;
