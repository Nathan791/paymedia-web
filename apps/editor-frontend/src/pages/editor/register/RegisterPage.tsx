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
    Select,
    Alert,
    Group,
    Divider,
    Box,
} from '@mantine/core';
import { useAuthStore } from '@/stores';
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

    const handleSubmit = async (e: React.FormEvent) => {
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

        try {
            await register({
                username: formData.username,
                email: formData.email,
                phone: formData.phone,
                country_code: formData.country_code,
                currency: formData.currency,
                password: formData.password,
            });
            navigate('/editor/dashboard');
        } catch (error) {
            console.error("Erreur d'inscription:", error);
        }
    };

    return (
        <Container size={500} my={40}>
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
                                width: 160,
                                maxWidth: '85%',
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
                        CRÉER UN COMPTE ÉDITEUR
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
                            label="Nom d'utilisateur"
                            placeholder="Votre pseudo"
                            value={formData.username}
                            onChange={(e) => handleChange('username', e.target.value)}
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

                        <TextInput
                            label="Email"
                            placeholder="exemple@paymedia.com"
                            value={formData.email}
                            onChange={(e) => handleChange('email', e.target.value)}
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

                        <TextInput
                            label="Téléphone WhatsApp"
                            placeholder="+237 691 234 567"
                            value={formData.phone}
                            onChange={(e) => handleChange('phone', e.target.value)}
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

                        <Group grow mt="md">
                            <Select
                                label="Pays"
                                placeholder="Sélectionnez"
                                data={[
                                    { value: 'CM', label: '🇨🇲 Cameroun' },
                                    { value: 'CI', label: '🇨🇮 Côte d\'Ivoire' },
                                    { value: 'SN', label: '🇸🇳 Sénégal' },
                                    { value: 'FR', label: '🇫🇷 France' },
                                ]}
                                value={formData.country_code}
                                onChange={(value) => handleChange('country_code', value || 'CM')}
                                styles={{
                                    input: {
                                        borderColor: 'rgba(12, 175, 122, 0.20)',
                                        '&:focus': {
                                            borderColor: '#0CAF7A',
                                        },
                                    },
                                    label: { fontWeight: 500, color: '#2D3748' },
                                }}
                            />

                            <Select
                                label="Devise"
                                placeholder="Sélectionnez"
                                data={[
                                    { value: 'XAF', label: 'FCFA (XAF)' },
                                    { value: 'EUR', label: 'Euro (€)' },
                                    { value: 'USD', label: 'Dollar ($)' },
                                ]}
                                value={formData.currency}
                                onChange={(value) => handleChange('currency', value || 'XAF')}
                                styles={{
                                    input: {
                                        borderColor: 'rgba(12, 175, 122, 0.20)',
                                        '&:focus': {
                                            borderColor: '#0CAF7A',
                                        },
                                    },
                                    label: { fontWeight: 500, color: '#2D3748' },
                                }}
                            />
                        </Group>

                        <PasswordInput
                            label="Mot de passe"
                            placeholder="Au moins 6 caractères"
                            value={formData.password}
                            onChange={(e) => handleChange('password', e.target.value)}
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

                        <PasswordInput
                            label="Confirmer le mot de passe"
                            placeholder="Retapez votre mot de passe"
                            value={formData.confirmPassword}
                            onChange={(e) => handleChange('confirmPassword', e.target.value)}
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
                            Créer mon compte éditeur
                        </Button>
                    </form>

                    <Text ta="center" size="sm">
                        Vous avez déjà un compte ?{' '}
                        <Anchor
                            component={Link}
                            to="/login"
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
                            Se connecter
                        </Anchor>
                    </Text>

                    <Text ta="center" size="xs" c="dimmed" style={{ marginTop: 4 }}>
                        v1.0.0 · PayMedia Éditeur
                    </Text>
                </Stack>
            </Paper>
        </Container>
    );
};