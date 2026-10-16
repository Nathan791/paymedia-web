// src/pages/Register/RegisterPage.tsx
//
// Toutes les couleurs viennent du thème centralisé (src/theme/index.ts).
// Aucun code hexadécimal en dur — voir theme/index.ts pour changer une couleur.
import { useState, FormEvent } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import {
    Alert,
    Anchor,
    Box,
    Button,
    Container,
    Divider,
    Group,
    Paper,
    PasswordInput,
    Select,
    Stack,
    Text,
    TextInput,
} from '@mantine/core';

import { useAuthStore } from '@/stores/auth.store';
import paymediaLogo from '@/assets/logo_paymedia_1.png';

export const RegisterPage = () => {
    const navigate = useNavigate();
    const { register, isLoading, error, clearError } = useAuthStore();

    const [formData, setFormData] = useState({
        username: '',
        email: '',
        phone: '',
        country_code: 'CM',
        currency: 'XAF',
        password: '',
        confirmPassword: '',
    });

    const handleChange = (field: string, value: string) => {
        setFormData((prev) => ({ ...prev, [field]: value }));
    };

    const handleSubmit = async (e: FormEvent) => {
        e.preventDefault();

        if (!formData.username.trim()) {
            alert("Le nom d'utilisateur est obligatoire");
            return;
        }
        if (!formData.email.trim()) {
            alert("L'email est obligatoire");
            return;
        }
        if (!formData.phone.trim()) {
            alert('Le numéro de téléphone est obligatoire');
            return;
        }
        if (formData.password.length < 6) {
            alert('Le mot de passe doit contenir au moins 6 caractères');
            return;
        }
        if (formData.password !== formData.confirmPassword) {
            alert('Les mots de passe ne correspondent pas');
            return;
        }

        clearError();

        try {
            await register({
                username: formData.username,
                email: formData.email,
                phone: formData.phone,
                country_code: formData.country_code,
                currency: formData.currency,
                password: formData.password,
            });
            navigate('/editor/dashboard', { replace: true });
        } catch {
            // L'erreur est gérée par le store
        }
    };

    return (
        <Box
            mih="100vh"
            py={40}
            style={{
                background: 'var(--mantine-color-forest-0)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
            }}
        >
            <Container size={500} w="100%">
                <Paper radius="lg" p="xl" withBorder shadow="sm" pos="relative" style={{ overflow: 'hidden' }}>
                    <Box style={{ position: 'absolute', inset: '0 0 auto', height: 4, background: 'var(--mantine-color-forest-6)' }} />

                    <Stack gap="lg" mt={8}>
                        <Box ta="center">
                            <img src={paymediaLogo} alt="PayMedia" style={{ width: 160, maxWidth: '85%', height: 'auto' }} />
                        </Box>

                        <Text ta="center" c="ink.8" size="sm" fw={600} style={{ letterSpacing: 0.8 }}>
                            CRÉER UN COMPTE ÉDITEUR
                        </Text>

                        <Divider />

                        {error && (
                            <Alert color="red" onClose={clearError} withCloseButton radius="md">
                                {error}
                            </Alert>
                        )}

                        <form onSubmit={handleSubmit}>
                            <Stack gap="md">
                                <TextInput
                                    label="Nom d'utilisateur"
                                    placeholder="Votre pseudo"
                                    value={formData.username}
                                    onChange={(e) => handleChange('username', e.currentTarget.value)}
                                    required
                                    size="md"
                                />

                                <TextInput
                                    label="Email"
                                    placeholder="exemple@paymedia.com"
                                    value={formData.email}
                                    onChange={(e) => handleChange('email', e.currentTarget.value)}
                                    required
                                    size="md"
                                />

                                <TextInput
                                    label="Téléphone WhatsApp"
                                    placeholder="+237 691 234 567"
                                    value={formData.phone}
                                    onChange={(e) => handleChange('phone', e.currentTarget.value)}
                                    required
                                    size="md"
                                />

                                <Group grow>
                                    <Select
                                        label="Pays"
                                        data={[
                                            { value: 'CM', label: 'Cameroun' },
                                            { value: 'CI', label: "Côte d'Ivoire" },
                                            { value: 'SN', label: 'Sénégal' },
                                            { value: 'FR', label: 'France' },
                                            { value: 'US', label: 'USA' },
                                        ]}
                                        value={formData.country_code}
                                        onChange={(value) => handleChange('country_code', value || 'CM')}
                                    />

                                    <Select
                                        label="Devise"
                                        data={[
                                            { value: 'XAF', label: 'FCFA (XAF)' },
                                            { value: 'EUR', label: 'Euro (€)' },
                                            { value: 'USD', label: 'Dollar ($)' },
                                        ]}
                                        value={formData.currency}
                                        onChange={(value) => handleChange('currency', value || 'XAF')}
                                    />
                                </Group>

                                <PasswordInput
                                    label="Mot de passe"
                                    placeholder="Au moins 6 caractères"
                                    value={formData.password}
                                    onChange={(e) => handleChange('password', e.currentTarget.value)}
                                    required
                                    size="md"
                                />

                                <PasswordInput
                                    label="Confirmer le mot de passe"
                                    placeholder="Retapez votre mot de passe"
                                    value={formData.confirmPassword}
                                    onChange={(e) => handleChange('confirmPassword', e.currentTarget.value)}
                                    required
                                    size="md"
                                />

                                <Button type="submit" fullWidth size="md" loading={isLoading} mt="sm" variant="outline" color="forest" fw={600}>
                                    Créer mon compte éditeur
                                </Button>
                            </Stack>
                        </form>

                        <Text ta="center" size="sm">
                            Vous avez déjà un compte ?{' '}
                            <Anchor component={Link} to="/login" fw={600} c="forest.6">
                                Se connecter
                            </Anchor>
                        </Text>

                        <Text ta="center" size="xs" c="dimmed">© 2026 PayMedia · Éditeur</Text>
                    </Stack>
                </Paper>
            </Container>
        </Box>
    );
};
