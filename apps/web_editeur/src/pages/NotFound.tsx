// src/pages/NotFound.tsx
import { Link } from 'react-router-dom';
import { Button, Center, Stack, Text, Title } from '@mantine/core';

export function NotFound() {
    return (
        <Center h="100vh">
            <Stack align="center" gap="xs">
                <Title order={1} style={{ fontFamily: 'Fraunces, serif' }} c="ink.6">404</Title>
                <Text c="dimmed">Cette page n'existe pas.</Text>
                <Button component={Link} to="/editor/dashboard" mt="md">Retour au tableau de bord</Button>
            </Stack>
        </Center>
    );
}
