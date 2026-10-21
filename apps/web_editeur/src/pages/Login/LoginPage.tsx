// src/pages/Login/LoginPage.tsx

import { useState, FormEvent } from 'react';

import {
    useNavigate,
    useLocation,
    Navigate,
    Link,
} from 'react-router-dom';

import {
    Alert,
    Anchor,
    Box,
    Button,
    Container,
    Divider,
    Paper,
    PasswordInput,
    Stack,
    Text,
    TextInput,
} from '@mantine/core';

import {
    IconAlertCircle,
    IconBrandGoogle,
    IconLock,
    IconMail,
} from '@tabler/icons-react';

import { useAuthStore } from '@/stores/auth.store';
import { useAuth } from '@/context/AuthContext';

import paymediaLogo from '@/assets/logo_paymedia_1.png';

// ============================================================================
// PAGE DE CONNEXION
// ============================================================================

export function LoginPage() {

    const navigate = useNavigate();
    const location = useLocation();

    const {
        isAuthenticated,
        isRestoring,
    } = useAuth();

    const {
        login,
        isLoading,
        error,
        clearError,
    } = useAuthStore();

    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');

    if (!isRestoring && isAuthenticated) {
        const from =
            (location.state as any)?.from?.pathname
            || '/editor/dashboard';

        return (
            <Navigate
                to={from}
                replace
            />
        );
    }

    const handleSubmit = async (
        e: FormEvent
    ) => {
        e.preventDefault();
        clearError();

        try {
            await login({
                email,
                password,
            });

            navigate(
                '/editor/dashboard',
                {
                    replace: true,
                }
            );

        } catch {
            // L'erreur est gérée par le store
        }
    };

    const handleGoogleLogin = async () => {
        clearError();

        try {
            // Si la méthode google() n'existe pas encore dans ton store, 
            // tu peux l'ajouter ou simuler l'appel ici en attendant.
            navigate(
                '/editor/dashboard',
                {
                    replace: true,
                }
            );

        } catch {
            // Gérer l'erreur si nécessaire
        }
    };

    return (
        <Box
            mih="100vh"
            px={{ base: 16, sm: 24 }}
            py={{ base: 20, sm: 24 }}
            style={{
                background: 'var(--mantine-color-forest-0)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
            }}
        >
            <Container
                size={440}
                w="100%"
                px={0}
            >
                <Paper
                    radius="lg"
                    p={{
                        base: 'lg',
                        sm: 28,
                    }}
                    withBorder
                    shadow="sm"
                    pos="relative"
                    style={{
                        overflow: 'hidden',
                    }}
                >
                    <Box
                        style={{
                            position: 'absolute',
                            top: 0,
                            left: 0,
                            right: 0,
                            height: 4,
                            background: 'var(--mantine-color-forest-6)',
                        }}
                    />

                    <Stack
                        gap="md"
                        mt={4}
                    >
                        <Box ta="center">
                            <img
                                src={paymediaLogo}
                                alt="PayMedia"
                                style={{
                                    width: 145,
                                    maxWidth: '70%',
                                    height: 'auto',
                                    display: 'inline-block',
                                }}
                            />

                            <Text
                                fw={700}
                                size="xl"
                                c="ink.8"
                                mt={4}
                            >
                                Connexion
                            </Text>

                            <Text
                                size="sm"
                                c="dimmed"
                                mt={2}
                            >
                                Accédez à votre espace de publication
                            </Text>
                        </Box>

                        {error && (
                            <Alert
                                color="red"
                                icon={
                                    <IconAlertCircle
                                        size={16}
                                    />
                                }
                                onClose={clearError}
                                withCloseButton
                                radius="md"
                                py="xs"
                            >
                                {error}
                            </Alert>
                        )}

                        <form
                            onSubmit={handleSubmit}
                        >
                            <Stack gap="sm">
                                <TextInput
                                    label="Adresse e-mail"
                                    placeholder="exemple@paymedia.com"
                                    leftSection={
                                        <IconMail
                                            size={17}
                                        />
                                    }
                                    value={email}
                                    onChange={(e) =>
                                        setEmail(
                                            e.currentTarget.value
                                        )
                                    }
                                    required
                                    size="md"
                                    autoComplete="email"
                                />

                                <PasswordInput
                                    label="Mot de passe"
                                    placeholder="Votre mot de passe"
                                    leftSection={
                                        <IconLock
                                            size={17}
                                        />
                                    }
                                    value={password}
                                    onChange={(e) =>
                                        setPassword(
                                            e.currentTarget.value
                                        )
                                    }
                                    required
                                    size="md"
                                    autoComplete="current-password"
                                />

                                <Box
                                    ta="right"
                                    mt={-6}
                                >
                                    <Anchor
                                        component={Link}
                                        to="/forgot-password"
                                        size="xs"
                                        c="forest.6"
                                        fw={500}
                                    >
                                        Mot de passe oublié ?
                                    </Anchor>
                                </Box>

                                <Button
                                    type="submit"
                                    fullWidth
                                    size="md"
                                    mt={4}
                                    loading={isLoading}
                                    variant="filled"
                                    color="forest"
                                    fw={600}
                                >
                                    Se connecter
                                </Button>
                            </Stack>
                        </form>

                        <Divider
                            label="Ou"
                            labelPosition="center"
                            my={2}
                        />

                        <Button
                            type="button"
                            fullWidth
                            size="md"
                            variant="default"
                            leftSection={
                                <IconBrandGoogle
                                    size={18}
                                />
                            }
                            onClick={handleGoogleLogin}
                            disabled={isLoading}
                        >
                            Continuer avec Google
                        </Button>

                        <Text
                            ta="center"
                            size="sm"
                            mt={2}
                        >
                            Vous n'avez pas encore de compte ?{' '}
                            <Anchor
                                component={Link}
                                to="/register"
                                fw={600}
                                c="forest.6"
                            >
                                Créer un compte
                            </Anchor>
                        </Text>

                        <Text
                            size="xs"
                            ta="center"
                            c="dimmed"
                            mt={-4}
                        >
                            © 2026 PayMedia · Web Éditeur
                        </Text>
                    </Stack>
                </Paper>
            </Container>
        </Box>
    );
}