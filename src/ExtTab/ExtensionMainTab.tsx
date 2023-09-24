import React from 'react';
import './ExtensionTab.css';
import { TChatItem } from './types';

interface ExtensionMainTabProps {
    apiKey: string;
    setApiKey: (newApiKey: string) => void;
    chatLog: TChatItem[];
    chatMessage: string;
    setChatMessage: (newMessage: string) => void;
    handleSendMessage: () => void;
}

const ExtensionMainTab: React.FC<ExtensionMainTabProps> = ({
    apiKey, 
    setApiKey,
    chatLog,
    chatMessage,
    setChatMessage,
    handleSendMessage,
}) => {
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
                        <p key={index} className={entry.role}>
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
}

export default ExtensionMainTab;
