import React from 'react';
import ReactDOM from 'react-dom/client';
import { MantineProvider } from '@mantine/core';
import { Notifications } from '@mantine/notifications';
import App from './App';
import '@mantine/core/styles.css';
import '@mantine/notifications/styles.css';
import './styles/globals.css';
import paymediaLogo from './assets/logo_paymedia_2.png';
const favicon = document.querySelector<HTMLLinkElement>('link[rel="icon"]');
if (favicon) {
    favicon.href = paymediaLogo;
}

document.title = 'PayMedia Admin';

ReactDOM.createRoot(document.getElementById('root')!).render(
    <React.StrictMode>
        <MantineProvider
            theme={{
                primaryColor: 'blue',
                defaultRadius: 'md',
                fontFamily: 'Inter, sans-serif',
            }}
        >
            <Notifications position="top-right" />
            <App />
        </MantineProvider>
    </React.StrictMode>
);