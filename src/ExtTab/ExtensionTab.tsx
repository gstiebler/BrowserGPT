import React, { useEffect, useState } from 'react';
import { Chat, ChatMessage, LLM, LLMMessage, Orquestrator } from '../orquestrator/orquestrator';
import * as openai from '../ai/openai';
import { extractCommands, extractMessageToUser } from '../ai/extractCommands';
import { promptSource } from '../ai/promptSource';
import { TChatItem } from './types';
import ExtensionMainTab from './ExtensionMainTab';
import { clickButtonMsg, htmlDocumentChangedMsg, openLinkMsg, printHtmlMsg, reloadHtmlMsg, setInputValueMsg } from '../constants';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';


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
        console.log('setInputValue');
        sendMessageToUserTab({ command: setInputValueMsg, id, value });
    },
    openLink: async (link: string) => {
        console.log('openLink');
        const result = await sendMessageToUserTab({ command: openLinkMsg, link });
    },
    clickSubmit: (id: string) => {
        console.log('clickSubmit');
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
    const [apiKeyText, setApiKeyText] = useState('');
    const [apiKey, setApiKey] = useState(null as string | null);
    const [chatMessage, setChatMessage] = useState(process.env.INITIAL_MESSAGE ?? '');
    const [chatLog, setChatLog] = useState<TChatItem[]>([]);
    const [orquestrator, setOrchestator] = useState<Orquestrator | null>(null);
    const [flowState, setFlowState] = useState('idle' as 'idle' | 'waiting');

    const setAndSaveApiKey = (newApiKey: string) => {
        localStorage.setItem('apiKey', newApiKey);
        setApiKey(newApiKey);
    }


    useEffect(() => {
        const storedApiKey = localStorage.getItem('apiKey');
        if (storedApiKey) {
            setApiKey(storedApiKey);
        }
    }, []);


    useEffect(() => {
        if (!apiKey) {
            return;
        }
        const chat = {
            showMessages: (messages: ChatMessage[]) => {
                setFlowState('idle');
                setChatLog(messages);
            },
        }
        const orquestrator = getOrquestrator(apiKey, chat);

        chrome.runtime?.onMessage.addListener((msg: any) => {
            console.log('msg received', msg);
            if (msg.type === htmlDocumentChangedMsg) {
                orquestrator.htmlDocumentChanged(msg.compactHtml);
            }
        });

        setOrchestator(orquestrator);
    }, [apiKey]);

    const handleSendMessage = async () => {
        if (!chatMessage) {
            return;
        }
        try {
            setFlowState('waiting');
            await orquestrator?.userMessageArrived(chatMessage);
        } catch (e: any) {
            setFlowState('idle');
            toast.error(e.message);
            console.error(e);
        }
        setChatMessage('');
    };

    if (apiKey) {
        return (
            <ExtensionMainTab
                chatLog={chatLog}
                chatMessage={chatMessage}
                flowState={flowState}
                setChatMessage={setChatMessage}
                handleSendMessage={handleSendMessage}
                printHtml={() => sendMessageToUserTab({ command: printHtmlMsg })}
                reloadHtml={() => sendMessageToUserTab({ command: reloadHtmlMsg })}
            />
        );
    } else {
        return (
            <div>
                <h1>Set API Key</h1>
                <input type="text" value={apiKeyText ?? ''} onChange={(e) => setApiKeyText(e.target.value)} />
                <button onClick={() => setAndSaveApiKey(apiKeyText)}>Confirm</button>
            </div>
        );
    }
};

export default ExtensionTab;
