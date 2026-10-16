// src/pages/ForgotPassword/ForgotPasswordPage.tsx
//
// Page "Mot de passe oublié".
//
// Cette page ne connaît pas directement l'API.
// Elle utilise le store d'authentification.
//

import {
    FormEvent,
    useState,
} from 'react';

import {
    Link,
    useNavigate,
} from 'react-router-dom';

import {
    Alert,
    Anchor,
    Box,
    Button,
    Container,
    Divider,
    Paper,
    Stack,
    Text,
    TextInput,
} from '@mantine/core';

import {
    IconAlertCircle,
    IconArrowLeft,
    IconCheck,
    IconMail,
} from '@tabler/icons-react';

import {
    useAuthStore,
} from '@/stores/auth.store';

import paymediaLogo from '@/assets/logo_paymedia_1.png';

export function ForgotPasswordPage() {

    const navigate =
        useNavigate();

    const {
        forgotPassword,
        isLoading,
        error,
        clearError,
    } =
        useAuthStore();

    const [
        email,
        setEmail,
    ] =
        useState('');

    const [
        submitted,
        setSubmitted,
    ] =
        useState(false);

    // -------------------------------------------------------------------------
    // SOUMISSION
    // -------------------------------------------------------------------------

    const handleSubmit =
        async (
            event: FormEvent
        ) => {

            event.preventDefault();

            clearError();

            try {

                await forgotPassword({
                    email,
                });

                setSubmitted(
                    true
                );

            } catch {
                // L'erreur est déjà enregistrée
                // dans le store.
            }
        };

    // -------------------------------------------------------------------------
    // RENDU
    // -------------------------------------------------------------------------

    return (
        <Box
            mih="100vh"
            py={40}
            style={{
                background:
                    'var(--mantine-color-forest-0)',

                display:
                    'flex',

                alignItems:
                    'center',

                justifyContent:
                    'center',

                padding:
                    '40px 20px',
            }}
        >

            <Container
                size={420}
                w="100%"
                px={0}
            >

                <Paper
                    radius="lg"
                    p={{
                        base: 'lg',
                        sm: 'xl',
                    }}
                    withBorder
                    shadow="sm"
                    pos="relative"
                    style={{
                        overflow:
                            'hidden',
                    }}
                >

                    {/* Liseré de marque supérieur */}
                    <Box
                        style={{
                            position:
                                'absolute',

                            inset:
                                '0 0 auto',

                            height:
                                4,

                            background:
                                'var(--mantine-color-forest-6)',
                        }}
                    />

                    <Stack
                        gap="lg"
                        mt={8}
                    >

                        {/* Logo */}
                        <Box ta="center">

                            <img
                                src={paymediaLogo}
                                alt="PayMedia"
                                style={{
                                    width:
                                        180,

                                    maxWidth:
                                        '90%',

                                    height:
                                        'auto',
                                }}
                            />

                        </Box>

                        {!submitted ? (

                            <>
                                <Box ta="center">

                                    <Text
                                        fw={700}
                                        size="lg"
                                        c="ink.8"
                                    >
                                        Mot de passe oublié ?
                                    </Text>

                                    <Text
                                        size="sm"
                                        c="dimmed"
                                        mt={4}
                                    >
                                        Entrez votre adresse e-mail pour
                                        recevoir les instructions de
                                        réinitialisation.
                                    </Text>

                                </Box>

                                <Divider />

                                {error && (
                                    <Alert
                                        color="red"
                                        icon={
                                            <IconAlertCircle
                                                size={16}
                                            />
                                        }
                                        onClose={
                                            clearError
                                        }
                                        withCloseButton
                                        radius="md"
                                    >
                                        {error}
                                    </Alert>
                                )}

                                <form
                                    onSubmit={
                                        handleSubmit
                                    }
                                >

                                    <Stack gap="md">

                                        <TextInput
                                            label="Adresse e-mail"
                                            placeholder="exemple@paymedia.com"
                                            leftSection={
                                                <IconMail
                                                    size={17}
                                                />
                                            }
                                            value={
                                                email
                                            }
                                            onChange={(
                                                event
                                            ) =>
                                                setEmail(
                                                    event
                                                        .currentTarget
                                                        .value
                                                )
                                            }
                                            required
                                            size="md"
                                            type="email"
                                            autoComplete="email"
                                        />

                                        <Button
                                            type="submit"
                                            fullWidth
                                            size="md"
                                            loading={
                                                isLoading
                                            }
                                            color="forest"
                                            fw={600}
                                        >
                                            Envoyer le lien
                                        </Button>

                                    </Stack>

                                </form>
                            </>

                        ) : (

                            <>
                                <Box ta="center">

                                    <IconCheck
                                        size={42}
                                        stroke={1.5}
                                    />

                                    <Text
                                        fw={700}
                                        size="lg"
                                        c="ink.8"
                                        mt="md"
                                    >
                                        Demande envoyée
                                    </Text>

                                    <Text
                                        size="sm"
                                        c="dimmed"
                                        mt="xs"
                                    >
                                        Si un compte correspond à cette
                                        adresse, vous recevrez un e-mail
                                        contenant les instructions pour
                                        réinitialiser votre mot de passe.
                                    </Text>

                                </Box>

                                <Button
                                    variant="light"
                                    color="forest"
                                    component={Link}
                                    to="/login"
                                    leftSection={
                                        <IconArrowLeft
                                            size={17}
                                        />
                                    }
                                >
                                    Retour à la connexion
                                </Button>
                            </>
                        )}

                        {!submitted && (
                            <Text
                                ta="center"
                                size="sm"
                            >
                                <Anchor
                                    component={Link}
                                    to="/login"
                                    fw={600}
                                    c="forest.6"
                                >
                                    ← Retour à la connexion
                                </Anchor>
                            </Text>
                        )}

                        <Text
                            size="xs"
                            ta="center"
                            c="dimmed"
                        >
                            © 2026 PayMedia · Éditeur
                        </Text>

                    </Stack>

                </Paper>

            </Container>

        </Box>
    );
}