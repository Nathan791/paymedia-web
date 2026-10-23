import { Outlet } from 'react-router-dom';
import { AppShell, Box } from '@mantine/core';
import { useDisclosure } from '@mantine/hooks';
import { EditorSidebar } from '@/components/editor/sidebar/EditorSidebar.js';
import { EditorHeader } from '@/components/editor/header/EditorHeader.js';

export const EditorLayout = () => {
    const [opened, { toggle }] = useDisclosure();

    return (
        <AppShell
            header={{ height: 64 }}
            navbar={{
                width: 280,
                breakpoint: 'sm',
                collapsed: { mobile: !opened },
            }}
            padding="md"
            transitionDuration={300}
            styles={{
                main: {
                    backgroundColor: '#f8f9fa',
                    minHeight: 'calc(100vh - 64px)',
                },
            }}
        >
            <AppShell.Header>
                <EditorHeader onMenuToggle={toggle} opened={opened} />
            </AppShell.Header>

            <AppShell.Navbar>
                <EditorSidebar />
            </AppShell.Navbar>

            <AppShell.Main>
                <Box style={{ maxWidth: '1400px', margin: '0 auto' }}>
                    <Outlet />
                </Box>
            </AppShell.Main>
        </AppShell>
    );
};