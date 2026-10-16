
// src/pages/RessetPassword/RessetPasswordPage.tsx
//
// Page de réinitialisation du mot de passe.
//
// Cette page est généralement ouverte depuis le lien reçu par e-mail.
//
// Exemple d'URL :
// /reset-password?token=xxxxxxxx
//
// Le token est récupéré depuis les paramètres de l'URL puis envoyé
// au backend avec le nouveau mot de passe.
//
// IMPORTANT :
// Le backend attend le champ "newPassword" et non "password".

import { FormEvent, useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';

import {
    Alert,
    Anchor,
    Box,
    Button,
    Container,
    Paper,
    PasswordInput,
    Stack,
    Text,
    Title,
} from '@mantine/core';

import {
    IconAlertCircle,
    IconCheck,
    IconLock,
} from '@tabler/icons-react';

import paymediaLogo from '@/assets/logo_paymedia_1.png';

import { authService } from '@/services/auth.service';


// -----------------------------------------------------------------------------
// COMPOSANT
// -----------------------------------------------------------------------------

export function ResetPasswordPage() {

    const navigate = useNavigate();

    // useSearchParams permet de récupérer :
    //
    // /reset-password?token=ABC123
    //
    // => token = ABC123
    const [searchParams] = useSearchParams();

    const token = searchParams.get('token') || '';


    // -------------------------------------------------------------------------
    // ÉTAT DU FORMULAIRE
    // -------------------------------------------------------------------------

    const [newPassword, setNewPassword] = useState('');
    const [confirmation, setConfirmation] = useState('');

    const [isLoading, setIsLoading] = useState(false);

    const [error, setError] = useState<string | null>(null);

    const [success, setSuccess] = useState(false);


    // -------------------------------------------------------------------------
    // SOUMISSION
    // -------------------------------------------------------------------------

    const handleSubmit = async (
        event: FormEvent<HTMLFormElement>
    ) => {

        event.preventDefault();

        setError(null);


        // ---------------------------------------------------------------------
        // Vérification du token
        // ---------------------------------------------------------------------

        if (!token) {

            setError(
                'Le lien de réinitialisation est invalide ou incomplet.'
            );

            return;
        }


        // ---------------------------------------------------------------------
        // Vérification du mot de passe
        // ---------------------------------------------------------------------

        if (newPassword.length < 6) {

            setError(
                'Le nouveau mot de passe doit contenir au moins 6 caractères.'
            );

            return;
        }


        // ---------------------------------------------------------------------
        // Confirmation
        // ---------------------------------------------------------------------

        if (newPassword !== confirmation) {

            setError(
                'Les deux mots de passe ne correspondent pas.'
            );

            return;
        }


        // ---------------------------------------------------------------------
        // APPEL API
        // ---------------------------------------------------------------------

        setIsLoading(true);

        try {

            await authService.resetPassword({
                token,
                newPassword,
            });


            // Le mot de passe a été correctement modifié.
            setSuccess(true);


            // Après quelques secondes, on peut renvoyer
            // l'utilisateur vers la connexion.
            setTimeout(() => {
                navigate('/login', {
                    replace: true,
                });
            }, 1800);

        } catch (err) {

            setError(
                err instanceof Error
                    ? err.message
                    : 'Impossible de réinitialiser le mot de passe.'
            );

        } finally {

            setIsLoading(false);
        }
    };


    // -------------------------------------------------------------------------
    // AFFICHAGE DU SUCCÈS
    // -------------------------------------------------------------------------

    if (success) {

        return (
            <Box
                mih="100vh"
                p="md"
                style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    background:
                        'var(--mantine-color-forest-0)',
                }}
            >

                <Container
                    size={420}
                    w="100%"
                >

                    <Paper
                        withBorder
                        radius="lg"
                        p="xl"
                        shadow="sm"
                    >

                        <Stack
                            align="center"
                            gap="md"
                        >

                            <IconCheck
                                size={48}
                            />

                            <Title
                                order={2}
                                ta="center"
                            >
                                Mot de passe modifié
                            </Title>

                            <Text
                                ta="center"
                                c="dimmed"
                            >
                                Votre mot de passe a été
                                réinitialisé avec succès.
                            </Text>

                            <Text
                                size="sm"
                                c="dimmed"
                                ta="center"
                            >
                                Redirection vers la connexion...
                            </Text>

                        </Stack>

                    </Paper>

                </Container>

            </Box>
        );
    }


    // -------------------------------------------------------------------------
    // PAGE PRINCIPALE
    // -------------------------------------------------------------------------

    return (

        <Box
            mih="100vh"
            py={40}
            style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                background:
                    'var(--mantine-color-forest-0)',
                padding: '40px 20px',
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
                >

                    <Stack
                        gap="lg"
                    >

                        {/* -------------------------------------------------
                            LOGO PAYMEDIA
                        -------------------------------------------------- */}

                        <Box ta="center">

                            <img
                                src={paymediaLogo}
                                alt="PayMedia"
                                style={{
                                    width: 180,
                                    maxWidth: '90%',
                                    height: 'auto',
                                }}
                            />

                        </Box>


                        {/* -------------------------------------------------
                            TITRE
                        -------------------------------------------------- */}

                        <Box ta="center">

                            <Title
                                order={3}
                            >
                                Nouveau mot de passe
                            </Title>

                            <Text
                                size="sm"
                                c="dimmed"
                                mt={4}
                            >
                                Choisissez votre nouveau mot
                                de passe.
                            </Text>

                        </Box>


                        {/* -------------------------------------------------
                            ERREUR
                        -------------------------------------------------- */}

                        {error && (

                            <Alert
                                color="red"
                                icon={
                                    <IconAlertCircle
                                        size={16}
                                    />
                                }
                            >
                                {error}
                            </Alert>

                        )}


                        {/* -------------------------------------------------
                            FORMULAIRE
                        -------------------------------------------------- */}

                        <form
                            onSubmit={handleSubmit}
                        >

                            <Stack gap="md">

                                <PasswordInput
                                    label="Nouveau mot de passe"
                                    placeholder="Votre nouveau mot de passe"
                                    leftSection={
                                        <IconLock
                                            size={17}
                                        />
                                    }
                                    value={newPassword}
                                    onChange={(event) =>
                                        setNewPassword(
                                            event.currentTarget.value
                                        )
                                    }
                                    autoComplete="new-password"
                                    required
                                />


                                <PasswordInput
                                    label="Confirmer le mot de passe"
                                    placeholder="Répétez votre mot de passe"
                                    leftSection={
                                        <IconLock
                                            size={17}
                                        />
                                    }
                                    value={confirmation}
                                    onChange={(event) =>
                                        setConfirmation(
                                            event.currentTarget.value
                                        )
                                    }
                                    autoComplete="new-password"
                                    required
                                />


                                <Button
                                    type="submit"
                                    fullWidth
                                    color="forest"
                                    loading={isLoading}
                                    mt="sm"
                                >
                                    Réinitialiser le mot de passe
                                </Button>

                            </Stack>

                        </form>


                        {/* -------------------------------------------------
                            RETOUR LOGIN
                        -------------------------------------------------- */}

                        <Text
                            size="sm"
                            ta="center"
                        >

                            <Anchor
                                component={Link}
                                to="/login"
                                fw={600}
                                c="forest.6"
                            >
                                Retour à la connexion
                            </Anchor>

                        </Text>

                    </Stack>

                </Paper>

            </Container>

        </Box>
    );
}

