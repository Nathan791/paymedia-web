import { MantineProvider } from '@mantine/core';
import { Notifications } from '@mantine/notifications';
import { BrowserRouter } from 'react-router-dom';
import { paymediaTheme } from './theme';
import { AuthProvider } from './context/AuthContext';
import { AppRouter } from './routes/AppRouter';


function App() {
    return (
        <MantineProvider theme={paymediaTheme} defaultColorScheme="light">
            <Notifications position="top-right" />
            <BrowserRouter>
                <AuthProvider>
                    <AppRouter />
                </AuthProvider>
            </BrowserRouter>
        </MantineProvider>
    );
}

export default App;
