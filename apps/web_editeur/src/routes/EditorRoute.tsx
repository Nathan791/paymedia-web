// src/routes/EditorRoute.tsx
import { Navigate, useLocation } from 'react-router-dom';
import { Center, Loader, Stack, Text } from '@mantine/core';
import { useAuth } from '@/context/AuthContext';
import { ReactNode } from 'react';

export function EditorRoute({ children }: { children: ReactNode }) {
    const { isAuthenticated, isRestoring } = useAuth();
    const location = useLocation();

    if (isRestoring) {
        return (
            <Center h="100vh">
                <Stack align="center" gap="xs">
                    <Loader color="forest" />
                    <Text size="sm" c="dimmed">Chargement de votre espace…</Text>
                </Stack>
            </Center>
        );
    }

    if (!isAuthenticated) {
        return <Navigate to="/login" replace state={{ from: location }} />;
    }

    return <>{children}</>;
}
