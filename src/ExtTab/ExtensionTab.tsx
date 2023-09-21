import React, { useEffect, useState } from 'react';
import './ExtensionTab.css';
import { Chat, ChatMessage, LLM, LLMMessage, Orquestrator } from '../orquestrator/orquestrator';
import * as openai from '../ai/openai';
import { Command, extractCommands, extractMessageToUser } from '../ai/extractCommands';
import { promptSource } from '../ai/promptSource';

type TChatItem = {
    role: 'user' | 'system';
    message: string;
};

async function sendMessageToUserTab(payload: any) {
    return chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
        const currentTab = tabs[0];
        const result = chrome.tabs.sendMessage(currentTab.id ?? 0, payload);
        console.log(result);
        return result;
    });
}

const getOrquestrator = (apiKey: string, chat: Chat): Orquestrator => {
    const llm: LLM = {
        send: async (messages: LLMMessage[]): Promise<string> => {
            const result = await openai.send(apiKey, messages);
            return result.choices[0].message.content ?? "";
        },
    };

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
        selectOption: (id: string, value: string) => {
            sendMessageToUserTab({ command: 'selectOption', id, value });
        },
    };
    
    const commandExtractor = { extractCommands, extractMessageToUser };

    const orquestrator = new Orquestrator(llm, htmlDoc, chat, promptSource, commandExtractor);
    return orquestrator;
};

const ExtensionTab = () => {
    const [apiKey, setApiKey] = useState('');
    const [chatMessage, setChatMessage] = useState('');
    const [chatLog, setChatLog] = useState<TChatItem[]>([]);
    const [orquestrator, setOrchestator] = useState<Orquestrator | null>(null);

    useEffect(() => {
        const chat = {
            showMessages: (messages: ChatMessage[]) => {
                setChatLog(messages);
            },
        }
        const orquestrator = getOrquestrator(apiKey, chat);

        chrome.runtime.onMessage.addListener((msg: any) => {
            if (msg.type == 'htmlDocumentChanged') {
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
        <div className="futuristic-container">
            <div className="intro-text">
                <p>Welcome to the Futuristic Interface.</p>
                <p>Experience the next generation of UI.</p>
            </div>
            <div className="api-key-container">
                <label htmlFor="api-key">API key</label>
                <input
                    id="api-key"
                    type="text"
                    value={apiKey}
                    onChange={e => setApiKey(e.target.value)}
                />
            </div>
            <div className="chat-interface">
                <div className="chat-log">
                    {chatLog.map((entry, index) => (
                        <p key={index} className={entry.type}>
                            {entry.message}
                        </p>
                    ))}
                </div>
                <div className="chat-input">
                    <input
                        type="text"
                        value={chatMessage}
                        onChange={e => setChatMessage(e.target.value)}
                        placeholder="Type a message..."
                    />
                    <button onClick={handleSendMessage}>Send</button>
                </div>
            </div>
        </div>
    );
};

export default ExtensionTab;
