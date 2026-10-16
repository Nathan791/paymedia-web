
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

    // ------------------------------------------------------------------------
    // NAVIGATION
    // ------------------------------------------------------------------------
    //
    // navigate :
    // permet de rediriger l'utilisateur après une connexion réussie.
    //
    // location :
    // permet notamment de récupérer la page demandée avant la connexion.

    const navigate = useNavigate();
    const location = useLocation();


    // ------------------------------------------------------------------------
    // ÉTAT GLOBAL D'AUTHENTIFICATION
    // ------------------------------------------------------------------------
    //
    // useAuth() permet de savoir si une session est déjà active.
    //
    // isRestoring est important au démarrage de l'application :
    // on évite d'afficher brièvement la page de login alors que la session
    // existante est encore en cours de restauration.

    const {
        isAuthenticated,
        isRestoring,
    } = useAuth();


    // ------------------------------------------------------------------------
    // ACTIONS DU STORE AUTHENTIFICATION
    // ------------------------------------------------------------------------


    const {
        login,
        google,
        isLoading,
        error,
        clearError,
    } = useAuthStore();


    // ------------------------------------------------------------------------
    // ÉTAT LOCAL DU FORMULAIRE
    // ------------------------------------------------------------------------

    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');


    // ------------------------------------------------------------------------
    // REDIRECTION SI DÉJÀ AUTHENTIFIÉ
    // ------------------------------------------------------------------------
    //
    // Si l'utilisateur possède déjà une session valide, il n'a aucune raison
    // de rester sur la page de connexion.

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


    // ------------------------------------------------------------------------
    // CONNEXION CLASSIQUE
    // ------------------------------------------------------------------------
    //
    // Le formulaire envoie uniquement les identifiants.
    // La gestion de la session est réalisée par le store/repository.

    const handleSubmit = async (
        e: FormEvent
    ) => {

        e.preventDefault();

        // Supprime une ancienne erreur avant la nouvelle tentative.
        clearError();

        try {

            await login({
                email,
                password,
            });

            // Connexion réussie :
            // on entre dans l'espace du Web Éditeur.

            navigate(
                '/editor/dashboard',
                {
                    replace: true,
                }
            );

        } catch {
            // L'erreur est déjà récupérée par le store.
            // Elle sera affichée dans le composant Alert.
        }
    };


    // ------------------------------------------------------------------------
    // CONNEXION GOOGLE
    // ------------------------------------------------------------------------
    //
    // Le bouton est déjà prévu dans l'interface.
    //
    // Le véritable échange OAuth est géré par le repository/service.
    // Une fois le flux backend finalisé, cette fonction appellera simplement
    // l'action google() du store.

    const handleGoogleLogin = async () => {

        clearError();

        try {

            await google();

            navigate(
                '/editor/dashboard',
                {
                    replace: true,
                }
            );

        } catch {
            // L'erreur est affichée par le store.
        }
    };


    // ------------------------------------------------------------------------
    // AFFICHAGE
    // ------------------------------------------------------------------------

    return (
        <Box
            mih="100vh"
            px={{ base: 16, sm: 24 }}
            py={{ base: 20, sm: 24 }}

            style={{
                // Couleur provenant du thème PayMedia.
                background:
                    'var(--mantine-color-forest-0)',

                // Centre la carte horizontalement et verticalement.
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

                {/* ============================================================
                    CARTE PRINCIPALE
                    ============================================================ */}

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
                        // Nécessaire pour que le liseré supérieur reste
                        // parfaitement contenu dans la carte.
                        overflow: 'hidden',
                    }}
                >

                    {/* ========================================================
                        LISERÉ PAYMEDIA
                        ======================================================== */}

                    <Box
                        style={{
                            position: 'absolute',
                            top: 0,
                            left: 0,
                            right: 0,
                            height: 4,

                            background:
                                'var(--mantine-color-forest-6)',
                        }}
                    />


                    <Stack
                        gap="md"
                        mt={4}
                    >

                        {/* ====================================================
                            IDENTITÉ PAYMEDIA
                            ==================================================== */}

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


                        {/* ====================================================
                            ERREUR D'AUTHENTIFICATION
                            ==================================================== */}

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


                        {/* ====================================================
                            FORMULAIRE
                            ==================================================== */}

                        <form
                            onSubmit={handleSubmit}
                        >

                            <Stack gap="sm">

                                {/* ------------------------------------------------
                                    EMAIL
                                    ------------------------------------------------ */}

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



                                {/* ------------------------------------------------
                                               MOT DE PASSE
                                    ------------------------------------------------ */}

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




                                {/* ------------------------------------------------
                                    BOUTON CONNEXION
                                    ------------------------------------------------ */}

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


                        {/* ====================================================
                            CONNEXION GOOGLE
                            ==================================================== */}

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


                        {/* ====================================================
                            INSCRIPTION
                            ==================================================== */}

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


                        {/* ====================================================
                            COPYRIGHT
                            ==================================================== */}

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
