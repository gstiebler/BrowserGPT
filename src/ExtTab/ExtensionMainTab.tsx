import React from 'react';
import { TextField, Button, Typography, Paper, Grid, Container, Box, Avatar } from '@mui/material';
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
        <Box sx={{ display: 'flex', flexDirection: 'column', pt: 2, width: '100%', height: '100vh' }} >
            <Box sx={{pl: 3, pb: 2, pr: 3}}>
                <TextField
                    label="API Key"
                    variant="outlined"
                    fullWidth
                    value={apiKey}
                    onChange={e => setApiKey(e.target.value)}
                />
            </Box>
            <Box sx={{ display: 'flex', flexDirection: 'column', pl: 3, pr: 3, width: '100%', flexGrow: 1 }} >
                <Typography variant="h6">Chat Log</Typography>
                <Box sx={{ width: '100%', height: '800px', display: 'flex', justifyContent: 'center', pb: 5 }} >
                    <Paper elevation={1} sx={{ p: 1, overflowY: 'scroll', height: '100%', width: '100%' }}>
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
            </Box>
            <Box sx={{ pl: 3, pb: 2, pr: 2 }}>
                <Box sx={{ display: 'flex', justifyContent: 'center', pb: 2 }} >
                    <TextField
                        value={chatMessage}
                        onChange={e => setChatMessage(e.target.value)}
                        style={{ width: '100%', height: '60px' }}
                    />
                </Box>
                <Button variant="contained" color="primary" onClick={handleSendMessage}>
                    Send
                </Button>
            </Box>
            <Box sx={{ pl: 3, pb: 2 }}>
                <Button variant="contained" color="primary" onClick={reloadHtml} sx={{ mr: 2 }} >
                    Reload HTML
                </Button>

                <Button variant="contained" color="primary" onClick={printHtml}>
                    Print HTML
                </Button>
            </Box>
        </Box>
    );
};

export default ExtensionMainTab;
