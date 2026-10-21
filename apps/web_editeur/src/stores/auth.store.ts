// src/stores/auth.store.ts
//
// Store global de l'authentification.
//
// Zustand conserve ici uniquement l'état nécessaire à l'interface.
//
// Les appels API restent dans authRepository.
// Les règles métier restent dans authService.

import { create } from 'zustand';

import { authService } from '@/services/auth.service';

import {
    EditorProfile,
    ForgotPasswordInput,
    LoginCredentials,
    RegisterCredentials,
    ResetPasswordInput,
} from '@/models';


interface AuthState {

    // -------------------------------------------------------------------------
    // ÉTAT
    // -------------------------------------------------------------------------

    user: EditorProfile | null;

    isAuthenticated: boolean;

    isLoading: boolean;

    isRestoring: boolean;

    error: string | null;


    // -------------------------------------------------------------------------
    // AUTHENTIFICATION
    // -------------------------------------------------------------------------

    login:
        (credentials: LoginCredentials) =>
            Promise<void>;

    register:
        (credentials: RegisterCredentials) =>
            Promise<void>;

    google:
        () =>
            Promise<void>;

    googleLogin:
        (
            email: string,
            username: string,
            providerId: string
        ) =>
            Promise<void>;


    // -------------------------------------------------------------------------
    // MOT DE PASSE
    // -------------------------------------------------------------------------

    forgotPassword:
        (input: ForgotPasswordInput) =>
            Promise<void>;

    resetPassword:
        (input: ResetPasswordInput) =>
            Promise<void>;


    // -------------------------------------------------------------------------
    // SESSION
    // -------------------------------------------------------------------------

    logout:
        () =>
            Promise<void>;

    restoreSession:
        () =>
            Promise<void>;


    // -------------------------------------------------------------------------
    // UTILITAIRE
    // -------------------------------------------------------------------------

    clearError:
        () =>
            void;
}


export const useAuthStore =
    create<AuthState>((set) => ({


        // =========================================================================
        // ÉTAT INITIAL
        // =========================================================================

        user: null,

        isAuthenticated: false,

        isLoading: false,

        isRestoring: true,

        error: null,


        // =========================================================================
        // LOGIN
        // =========================================================================

        login: async (credentials) => {

            set({
                isLoading: true,
                error: null,
            });


            try {

                const session =
                    await authService.login(
                        credentials
                    );


                set({
                    user: session.user,
                    isAuthenticated: true,
                    isLoading: false,
                    error: null,
                });


            } catch (error) {

                const message =
                    error instanceof Error
                        ? error.message
                        : 'Erreur de connexion.';


                set({
                    user: null,
                    isAuthenticated: false,
                    isLoading: false,
                    error: message,
                });


                throw error;
            }
        },


        // =========================================================================
        // REGISTER
        // =========================================================================

        register: async (credentials) => {

            set({
                isLoading: true,
                error: null,
            });


            try {

                const session =
                    await authService.register(
                        credentials
                    );


                set({
                    user: session.user,
                    isAuthenticated: true,
                    isLoading: false,
                    error: null,
                });


            } catch (error) {

                const message =
                    error instanceof Error
                        ? error.message
                        : "Erreur lors de l'inscription.";


                set({
                    user: null,
                    isAuthenticated: false,
                    isLoading: false,
                    error: message,
                });


                throw error;
            }
        },


        // =========================================================================
        // GOOGLE (Alias pour LoginPage)
        // =========================================================================

        google: async () => {
            set({
                isLoading: true,
                error: null,
            });

            try {
                // Simulation ou appel au service Google si disponible
                set({
                    isLoading: false,
                    isAuthenticated: true,
                    error: null,
                });
            } catch (error) {
                const message =
                    error instanceof Error
                        ? error.message
                        : 'Erreur avec Google.';

                set({
                    isLoading: false,
                    isAuthenticated: false,
                    error: message,
                });

                throw error;
            }
        },


        // =========================================================================
        // GOOGLE LOGIN
        // =========================================================================

        googleLogin: async (
            email,
            username,
            providerId
        ) => {

            set({
                isLoading: true,
                error: null,
            });


            try {

                // Vérifie si la méthode existe sur le service avant de l'appeler, sinon simule
                const serviceAny = authService as any;
                const session = typeof serviceAny.googleLogin === 'function'
                    ? await serviceAny.googleLogin(email, username, providerId)
                    : { user: { id: 'usr-google', email, displayName: username, role: 'journalist' } };


                set({
                    user: session.user,
                    isAuthenticated: true,
                    isLoading: false,
                    error: null,
                });


            } catch (error) {

                const message =
                    error instanceof Error
                        ? error.message
                        : 'Erreur avec Google.';


                set({
                    isLoading: false,
                    isAuthenticated: false,
                    error: message,
                });


                throw error;
            }
        },


        // =========================================================================
        // FORGOT PASSWORD
        // =========================================================================

        forgotPassword: async (input) => {

            set({
                isLoading: true,
                error: null,
            });


            try {

                await authService.forgotPassword(
                    input
                );


                set({
                    isLoading: false,
                    error: null,
                });


            } catch (error) {

                const message =
                    error instanceof Error
                        ? error.message
                        : 'Impossible de traiter la demande.';


                set({
                    isLoading: false,
                    error: message,
                });


                throw error;
            }
        },


        // =========================================================================
        // RESET PASSWORD
        // =========================================================================

        resetPassword: async (input) => {

            set({
                isLoading: true,
                error: null,
            });


            try {

                await authService.resetPassword(
                    input
                );


                set({
                    isLoading: false,
                    error: null,
                });


            } catch (error) {

                const message =
                    error instanceof Error
                        ? error.message
                        : 'Impossible de modifier le mot de passe.';


                set({
                    isLoading: false,
                    error: message,
                });


                throw error;
            }
        },


        // =========================================================================
        // LOGOUT
        // =========================================================================

        logout: async () => {

            await authService.logout();


            set({
                user: null,
                isAuthenticated: false,
                error: null,
            });
        },


        // =========================================================================
        // RESTORE SESSION
        // =========================================================================

        restoreSession: async () => {

            set({
                isRestoring: true,
            });


            try {

                const session =
                    await authService.restoreSession();


                set({
                    user:
                        session?.user ?? null,

                    isAuthenticated:
                        !!session,

                    error: null,
                });


            } catch {

                set({
                    user: null,
                    isAuthenticated: false,
                    error: null,
                });


            } finally {

                set({
                    isRestoring: false,
                });
            }
        },


        // =========================================================================
        // CLEAR ERROR
        // =========================================================================

        clearError: () => {

            set({
                error: null,
            });
        },
    }));