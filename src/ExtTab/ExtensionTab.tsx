import React, { useState } from 'react';
import { send } from '../ai/openai';
import './ExtensionTab.css';
import { Chat, ChatMessage, LLM, LLMMessage, Orquestrator } from '../orquestrator/orquestrator';
import * as openai from '../ai/openai';
import { Command, extractCommands, extractMessageToUser } from '../ai/extractCommands';
import { promptSource } from '../ai/promptSource';

type TChatItem = {
    role: 'user' | 'system';
    message: string;
};

function sendMessageToUserTab() {
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
        const currentTab = tabs[0];
        chrome.tabs.sendMessage(currentTab.id ?? 0, { type: 'execute' });
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
        setInputValue: (id: string, value: string) => {},
        openLink: (link: string) => {},
        clickSubmit: (id: string) => {},
        selectOption: (id: string, value: string) => {},
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

    const onNewApiKey = (apiKey: string) => {
        const chat = {
            showMessages: (messages: ChatMessage[]) => {
                setChatLog(messages);
            },
        }
        setOrchestator(getOrquestrator(apiKey, chat));
    };

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
                    onChange={e => onNewApiKey(e.target.value)}
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
