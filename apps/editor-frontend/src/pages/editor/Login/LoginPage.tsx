// src/pages/LoginPage.tsx
import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import {
    Container,
    Paper,
    Text,
    TextInput,
    PasswordInput,
    Button,
    Stack,
    Anchor,
    Divider,
    Box,
    Alert,
} from '@mantine/core';
import { useAuthStore } from '@/stores';
import paymediaLogo from '@/assets/logo_paymedia_1.png';

export const LoginPage = () => {
    const navigate = useNavigate();
    const { login, isLoading, error, clearError } = useAuthStore();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            await login(email, password);
            navigate('/editor/dashboard');
        } catch (error) {
            console.error('Erreur:', error);
        }
    };

    return (
        <Container size={420} my={40}>
            <Paper
                radius="lg"
                p="xl"
                withBorder
                shadow="xl"
                style={{
                    background: 'linear-gradient(145deg, #ffffff, #F7FBF9)',
                    border: '1px solid rgba(12, 175, 122, 0.10)',
                    position: 'relative',
                    overflow: 'hidden',
                }}
            >
                {/* Bandeau décoratif en haut */}
                <Box
                    style={{
                        position: 'absolute',
                        top: 0,
                        left: 0,
                        right: 0,
                        height: 4,
                        background: 'linear-gradient(90deg, #0CAF7A, #08875A, #0CAF7A)',
                        backgroundSize: '200% 100%',
                        animation: 'gradientMove 3s ease infinite',
                    }}
                />

                <Stack gap="lg" style={{ marginTop: 8 }}>
                    {/* Logo */}
                    <Box ta="center">
                        <img
                            src={paymediaLogo}
                            alt="PayMedia"
                            style={{
                                width: 180,
                                maxWidth: '90%',
                                height: 'auto',
                                objectFit: 'contain',
                                filter: 'drop-shadow(0 4px 25px rgba(12, 175, 122, 0.20))',
                                transition: 'transform 0.3s ease',
                            }}
                            onMouseEnter={(e) => {
                                e.currentTarget.style.transform = 'scale(1.02)';
                            }}
                            onMouseLeave={(e) => {
                                e.currentTarget.style.transform = 'scale(1)';
                            }}
                        />
                    </Box>

                    <Text ta="center" c="dimmed" size="sm" fw={500} style={{ letterSpacing: 1 }}>
                        ESPACE ÉDITEUR
                    </Text>

                    <Divider
                        style={{
                            borderColor: 'rgba(12, 175, 122, 0.15)',
                        }}
                    />

                    {error && (
                        <Alert
                            color="red"
                            onClose={clearError}
                            withCloseButton
                            radius="md"
                            style={{ border: '1px solid #FFE3E3' }}
                        >
                            {error}
                        </Alert>
                    )}

                    <form onSubmit={handleSubmit}>
                        <TextInput
                            label="Email"
                            placeholder="exemple@paymedia.com"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                            size="md"
                            styles={{
                                input: {
                                    borderColor: 'rgba(12, 175, 122, 0.20)',
                                    '&:focus': {
                                        borderColor: '#0CAF7A',
                                        boxShadow: '0 0 0 3px rgba(12, 175, 122, 0.10)',
                                    },
                                },
                                label: { fontWeight: 500, color: '#2D3748' },
                            }}
                        />
                        <PasswordInput
                            label="Mot de passe"
                            placeholder="Votre mot de passe"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                            mt="md"
                            size="md"
                            styles={{
                                input: {
                                    borderColor: 'rgba(12, 175, 122, 0.20)',
                                    '&:focus': {
                                        borderColor: '#0CAF7A',
                                        boxShadow: '0 0 0 3px rgba(12, 175, 122, 0.10)',
                                    },
                                },
                                label: { fontWeight: 500, color: '#2D3748' },
                            }}
                        />
                        <Button
                            type="submit"
                            fullWidth
                            mt="xl"
                            size="md"
                            loading={isLoading}
                            styles={{
                                root: {
                                    background: 'linear-gradient(135deg, #0CAF7A, #08875A)',
                                    border: 'none',
                                    fontWeight: 600,
                                    letterSpacing: 0.5,
                                    transition: 'transform 0.2s ease',
                                    '&:hover': {
                                        transform: 'translateY(-2px)',
                                        boxShadow: '0 8px 25px rgba(12, 175, 122, 0.30)',
                                    },
                                },
                            }}
                        >
                            Se connecter
                        </Button>
                    </form>

                    <Divider
                        label="Nouveau sur PayMedia ?"
                        labelPosition="center"
                        style={{ borderColor: 'rgba(12, 175, 122, 0.12)' }}
                        styles={{
                            label: { color: '#718096', fontSize: 12, fontWeight: 500 },
                        }}
                    />

                    <Text ta="center" size="sm">
                        <Anchor
                            component={Link}
                            to="/register"
                            fw={600}
                            style={{
                                color: '#0CAF7A',
                                textDecoration: 'none',
                                transition: 'color 0.2s ease',
                            }}
                            onMouseEnter={(e) => {
                                e.currentTarget.style.color = '#08875A';
                            }}
                            onMouseLeave={(e) => {
                                e.currentTarget.style.color = '#0CAF7A';
                            }}
                        >
                            Créer un compte éditeur
                        </Anchor>
                    </Text>

                    <Text
                        size="xs"
                        ta="center"
                        c="dimmed"
                    >
                        © 2026 PayMedia · Editeur
                    </Text>
                </Stack>
            </Paper>
        </Container>
    );
};