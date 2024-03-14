import React from 'react';
import ReactDOM from 'react-dom/client';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import App from './ExtTab/ExtensionTab';
import reportWebVitals from './reportWebVitals';
import { GlobalStyles } from '@mui/material';

const darkTheme = createTheme({
});

const root = ReactDOM.createRoot(
  document.getElementById('root') as HTMLElement
);
root.render(
  <ThemeProvider theme={darkTheme}>
    <GlobalStyles styles={{
      'html, body, #root': {
        height: '100%',
      },
    }} />
    <CssBaseline />
      <React.StrictMode>
          <App />
      </React.StrictMode>
    </ThemeProvider>
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
