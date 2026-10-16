
// src/services/auth.service.ts

import {
    AuthSession,
    ForgotPasswordInput,
    ForgotPasswordResponse,
    LoginCredentials,
    RegisterCredentials,
    ResetPasswordInput,
    ResetPasswordResponse,
} from '@/models';

import {
    authRepository,
} from '@/repositories/auth.repository';


// -----------------------------------------------------------------------------
// SERVICE AUTHENTIFICATION
// -----------------------------------------------------------------------------
//
// Le service constitue la couche métier entre l'interface et le repository.
//
// Page
//   ↓
// auth.store
//   ↓
// auth.service
//   ↓
// auth.repository
//   ↓
// API
//
// Les composants React ne doivent donc pas appeler directement apiClient.
// -----------------------------------------------------------------------------

export const authService = {

    // =========================================================================
    // LOGIN
    // =========================================================================

    login(
        credentials: LoginCredentials
    ): Promise<AuthSession> {

        const email =
            credentials.email.trim();

        if (!email || !credentials.password) {

            return Promise.reject(
                new Error(
                    'Veuillez renseigner votre e-mail et votre mot de passe.'
                )
            );
        }

        return authRepository.login({
            email,
            password: credentials.password,
        });
    },


    // =========================================================================
    // REGISTER
    // =========================================================================

    register(
        credentials: RegisterCredentials
    ): Promise<AuthSession> {

        if (!credentials.username.trim()) {

            return Promise.reject(
                new Error(
                    "Le nom d'utilisateur est obligatoire."
                )
            );
        }

        if (!credentials.email.trim()) {

            return Promise.reject(
                new Error(
                    "L'adresse e-mail est obligatoire."
                )
            );
        }

        if (!credentials.phone.trim()) {

            return Promise.reject(
                new Error(
                    'Le numéro de téléphone est obligatoire.'
                )
            );
        }

        if (credentials.password.length < 6) {

            return Promise.reject(
                new Error(
                    'Le mot de passe doit contenir au moins 6 caractères.'
                )
            );
        }

        return authRepository.register(
            credentials
        );
    },


    // =========================================================================
    // FORGOT PASSWORD
    // =========================================================================
    //
    // Envoie un e-mail de récupération au backend.
    // =========================================================================

    forgotPassword(
        credentials: ForgotPasswordInput
    ): Promise<ForgotPasswordResponse> {

        const email =
            credentials.email.trim().toLowerCase();

        if (!email) {

            return Promise.reject(
                new Error(
                    "Veuillez renseigner votre adresse e-mail."
                )
            );
        }

        return authRepository.forgotPassword({
            email,
        });
    },


    // =========================================================================
    // RESET PASSWORD
    // =========================================================================
    //
    // Le backend attend :
    //
    // {
    //     token,
    //     newPassword
    // }
    // =========================================================================

    resetPassword(
        credentials: ResetPasswordInput
    ): Promise<ResetPasswordResponse> {

        if (!credentials.token) {

            return Promise.reject(
                new Error(
                    'Le token de réinitialisation est obligatoire.'
                )
            );
        }

        if (
            !credentials.newPassword ||
            credentials.newPassword.length < 6
        ) {

            return Promise.reject(
                new Error(
                    'Le nouveau mot de passe doit contenir au moins 6 caractères.'
                )
            );
        }

        return authRepository.resetPassword(
            credentials
        );
    },


    // =========================================================================
    // RESTORE SESSION
    // =========================================================================

    restoreSession() {

        return authRepository.getSession();
    },


    // =========================================================================
    // LOGOUT
    // =========================================================================

    logout() {

        return authRepository.logout();
    },
};

