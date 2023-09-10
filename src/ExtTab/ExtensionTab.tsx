import React, { useState } from 'react';
import { send } from '../ai/openai';
import './ExtensionTab.css';

type TChatItem = {
    type: 'user' | 'system';
    message: string;
};

function sendMessage() {
    chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
        const currentTab = tabs[0];
        chrome.tabs.sendMessage(currentTab.id ?? 0, { type: 'execute' });
    });
}

const ExtensionTab = () => {
    const [apiKey, setApiKey] = useState('');
    const [chatMessage, setChatMessage] = useState('');
    const [chatLog, setChatLog] = useState<TChatItem[]>([]);

    const handleSendMessage = async () => {
        // sendMessage();

        if (!chatMessage) {
            return;
        }

        setChatLog([...chatLog, { type: 'user', message: chatMessage }]);

        const result = await send(apiKey, chatMessage);
        console.log(JSON.stringify(result));
        setChatLog([...chatLog, 
            { type: 'user', message: chatMessage }, 
            { type: 'system', message: (result.choices[0].message.content ?? "") },
        ]);

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
