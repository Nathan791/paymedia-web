import { AppShell, Burger, Group } from '@mantine/core';
import { useDisclosure } from '@mantine/hooks';
import { Outlet, useLocation } from 'react-router-dom';
import { useEffect } from 'react';

import { Header } from './Header';
import { Sidebar } from './Sidebar';

export function Layout() {
    const [opened, { toggle }] = useDisclosure();
    const location = useLocation();

    useEffect(() => {
        const titles: Record<string, string> = {
            '/dashboard': 'PayMedia Admin',
            '/users': 'PayMedia — Utilisateurs',
            '/contents': 'PayMedia — Contenus',
            '/transactions': 'PayMedia — Transactions',
            '/settings': 'PayMedia — Paramètres',
            '/profile': 'PayMedia — Profil',
        };

        document.title = titles[location.pathname] || 'PayMedia Admin';
    }, [location.pathname]);

    return (
        <AppShell
            header={{ height: 64 }}
            navbar={{
                width: 260,
                breakpoint: 'sm',
                collapsed: { mobile: !opened },
            }}
            padding="md"
            style={{
                backgroundColor: 'rgb(235, 245, 255)',
            }}
        >
            <AppShell.Header
                style={{
                    backgroundColor: '#ffffff',
                }}
            >
                <Group h="100%" px="md">
                    <Burger
                        opened={opened}
                        onClick={toggle}
                        hiddenFrom="sm"
                        size="sm"
                    />

                    <Header />
                </Group>
            </AppShell.Header>

            <AppShell.Navbar
                style={{
                    backgroundColor: 'rgb(8, 18, 51)',
                }}
            >
                <Sidebar />
            </AppShell.Navbar>

            <AppShell.Main>
                <Outlet />
            </AppShell.Main>
        </AppShell>
    );
}