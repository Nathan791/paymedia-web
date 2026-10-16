
import { MantineProvider } from '@mantine/core';
import { BrowserRouter } from 'react-router-dom';
import { AppRouter } from '@/routes/AppRouter';
import { AuthProvider } from '@/contexts/AuthContext';
import { Notifications } from '@mantine/notifications';
import '@mantine/core/styles.css';
import '@mantine/notifications/styles.css';
import './styles/index.css';

function App() {
    return (
        <MantineProvider
            defaultColorScheme="light"
            theme={{
                primaryColor: 'green',
                colors: {
                    green: [
                        '#E8F5E9',
                        '#C8E6C9',
                        '#A5D6A7',
                        '#81C784',
                        '#66BB6A',
                        '#4CAF50',
                        '#43A047',
                        '#388E3C',
                        '#2E7D32',
                        '#1B5E20',
                    ],
                },
            }}
        >
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