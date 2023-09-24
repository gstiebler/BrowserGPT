import React from 'react';
import { TextField, Button, Typography, Container, Paper } from '@mui/material';
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
        <Container maxWidth="md">
            <Paper elevation={3} style={{ padding: '20px' }}>
                <div style={{ margin: '20px 0' }}>
                    <TextField
                        label="API Key"
                        variant="outlined"
                        fullWidth
                        value={apiKey}
                        onChange={e => setApiKey(e.target.value)}
                    />
                </div>

                <div style={{ margin: '20px 0' }}>
                    <Typography variant="body1">Chat Log</Typography>
                    <Paper elevation={1} style={{ padding: '10px', height: '200px', overflow: 'auto' }}>
                        {chatLog.map((entry, index) => (
                            <Typography key={index} variant="body2" style={{ textAlign: entry.role === 'user' ? 'right' : 'left' }}>
                                {entry.message}
                            </Typography>
                        ))}
                    </Paper>
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '10px' }}>
                    <TextField
                        label="Type a message..."
                        variant="outlined"
                        style={{ flex: 1 }} // Takes up the available space
                        value={chatMessage}
                        onChange={e => setChatMessage(e.target.value)}
                    />
                    <Button variant="contained" color="primary" onClick={handleSendMessage}>
                        Send
                    </Button>
                </div>
            </Paper>
        </Container>
    );
};

export default ExtensionMainTab;
