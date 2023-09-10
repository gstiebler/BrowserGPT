import React, { useState } from 'react';
import './ExtensionTab.css';
import { send } from '../ai/openai';

const ExtensionTab: React.FC = () => {
    const [apiKey, setApiKey] = useState<string>('');

    const handleSend = async () => {
        console.log('API Key:', apiKey);
        chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
          const currentTab = tabs[0];
          chrome.tabs.sendMessage(currentTab.id ?? 0, { type: 'execute' });
        });
        const result = await send(apiKey, "Hello!");
        console.log(JSON.stringify(result));
    };

    return (
        <div className="extension-tab">
            <p>Welcome to the Chrome Extension!</p>
            <p>This is a simple tool to help you get started.</p>
            <div className="input-group">
                <label htmlFor="api-key">API key</label>
                <input
                    type="text"
                    id="api-key"
                    value={apiKey}
                    onChange={(e) => setApiKey(e.target.value)}
                />
            </div>
            <button onClick={handleSend}>Send</button>
        </div>
    );
}

export default ExtensionTab;
