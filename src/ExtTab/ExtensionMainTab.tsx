import React from 'react';
import { TextField, Button, Typography, Container, Paper, Avatar } from '@mui/material';
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
                    <Paper elevation={1} style={{ padding: '10px', height: '400px', overflow: 'auto' }}>  {/* Increased height */}
                        {chatLog.map((entry, index) => (
                            <div key={index} style={{
                                margin: '10px 0',
                                padding: '10px',
                                backgroundColor: entry.role === 'user' ? '#e6f7ff' : '#f2f2f2',
                                textAlign: entry.role === 'user' ? 'right' : 'left'
                            }}>
                                <Avatar>{entry.role === 'user' ? 'U' : 'S'}</Avatar>
                                <Typography variant="body2">
                                    {entry.message}
                                </Typography>
                            </div>
                        ))}
                    </Paper>
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '10px' }}>
                    <TextField
                        label="Type a message..."
                        variant="outlined"
                        multiline  // Allows multiple lines
                        rows={4}  // Sets the number of visible rows
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
