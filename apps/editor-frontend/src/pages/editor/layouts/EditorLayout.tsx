import { Outlet } from 'react-router-dom';
import { AppShell, Box } from '@mantine/core';
import { useDisclosure } from '@mantine/hooks';
import { EditorSidebar } from '@/components/editor/sidebar/EditorSidebar';
import { EditorHeader } from '@/components/editor/header/EditorHeader';

export const EditorLayout = () => {
    const [opened, { toggle }] = useDisclosure();

    return (
        <AppShell
            header={{ height: 60 }}
            navbar={{
                width: 280,
                breakpoint: 'sm',
                collapsed: { mobile: !opened },
            }}
            padding="md"
            transitionDuration={300}
        >
            <AppShell.Header>
                <EditorHeader opened={opened} toggle={toggle} />
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