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
        <Grid container direction="column" spacing={2} sx={{ height: '100vh', pt: 2 }}>
            <Grid item sx={{ display: 'flex', flexDirection: 'column' }} >
                <Container>
                    <TextField
                        label="API Key"
                        variant="outlined"
                        fullWidth
                        value={apiKey}
                        onChange={e => setApiKey(e.target.value)}
                    />
                </Container>
            </Grid>
            <Grid item xs sx={{ display: 'flex' }} >
                <Box sx={{ display: 'flex', flexDirection: 'column', pl: 3, pr: 3, width: '100%' }} >
                    <Typography variant="h6">Chat Log</Typography>

                    <Box sx={{ width: '100%', height: '95%', display: 'flex', justifyContent: 'center', pb: 2 }} >
                        <Paper elevation={1} sx={{ p: 1, height: '100%', width: '100%', overflow: 'auto' }}>
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

                    <Box sx={{ display: 'flex', justifyContent: 'center', pb: 2 }} >
                        <TextField
                            value={chatMessage}
                            onChange={e => setChatMessage(e.target.value)}
                            style={{ width: '100%', height: '80%' }}
                        />
                    </Box>
                    <Button variant="contained" color="primary" onClick={handleSendMessage}>
                        Send
                    </Button>
                </Box>
            </Grid>
            <Grid item sx={{ display: 'flex' }} >
                <Container >
                    <Button variant="contained" color="primary" onClick={reloadHtml} sx={{ mr: 2 }} >
                        Reload HTML
                    </Button>

                    <Button variant="contained" color="primary" onClick={printHtml}>
                        Print HTML
                    </Button>
                </Container>
            </Grid>
        </Grid>
    );
};

export default ExtensionMainTab;
