import React from 'react';
import { TextField, Button, Typography, Container, Paper, Avatar, Box } from '@mui/material';
import { TChatItem } from './types';

interface ExtensionMainTabProps {
    apiKey: string;
    setApiKey: (newApiKey: string) => void;
    chatLog: TChatItem[];
    chatMessage: string;
    setChatMessage: (newMessage: string) => void;
    handleSendMessage: () => void;
    printHtml: () => void;
    reloadHtml: () => void;
}

const ExtensionMainTab: React.FC<ExtensionMainTabProps> = ({
    apiKey,
    setApiKey,
    chatLog,
    chatMessage,
    setChatMessage,
    handleSendMessage,
    printHtml,
    reloadHtml
}) => {
    return (
        <Container maxWidth="md" sx={{ height: '100%' }}>
            <Paper elevation={3} sx={{ p: 2, height: '100%', display: 'flex', flexDirection: 'column' }}>
                <Box mb={3}>
                    <TextField
                        label="API Key"
                        variant="outlined"
                        fullWidth
                        value={apiKey}
                        onChange={e => setApiKey(e.target.value)}
                    />
                </Box>
                <Box mb={3} flexGrow={1}>
                    <Typography variant="body1">Chat Log</Typography>
                    <Paper elevation={1} sx={{ p: 1, height: '100%', overflow: 'auto' }}>
                        {chatLog.map((entry, index) => (
                            <Box key={index} mb={2} p={1} bgcolor={entry.role === 'user' ? '#e6f7ff' : '#f2f2f2'} textAlign={entry.role === 'user' ? 'right' : 'left'}>
                                <Avatar>{entry.role === 'user' ? 'U' : 'S'}</Avatar>
                                <Typography variant="body2">
                                    {entry.message}
                                </Typography>
                            </Box>
                        ))}
                    </Paper>
                </Box>
                <Box display="flex" justifyContent="space-between" alignItems="center" gap={2}>
                    <TextField
                        label="Type a message..."
                        variant="outlined"
                        multiline
                        rows={4}
                        sx={{ flex: 1 }}
                        value={chatMessage}
                        onChange={e => setChatMessage(e.target.value)}
                    />
                    <Button variant="contained" color="primary" onClick={handleSendMessage}>
                        Send
                    </Button>
                </Box>
            </Paper>

            <Button variant="contained" color="primary" onClick={reloadHtml}>
                Reload HTML
            </Button>

            <Button variant="contained" color="primary" onClick={printHtml}>
                Print HTML
            </Button>
        </Container>
    );
};

export default ExtensionMainTab;
