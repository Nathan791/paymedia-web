// src/repositories/auth.repository.ts

import {
    apiClient,
    clearAccessToken,
    setAccessToken,
} from '@/api/client';

import {
    AuthSession,
    EditorProfile,
    ForgotPasswordInput,
    ForgotPasswordResponse,
    GoogleAuthResponse,
    LoginCredentials,
    LoginResponse,
    RegisterCredentials,
    RegisterInput,
    RegisterResponse,
    ResetPasswordInput,
    TeamRole,
} from '@/models';


// -----------------------------------------------------------------------------
// CLÉS DE STOCKAGE
// -----------------------------------------------------------------------------

// Token d'accès utilisé par apiClient pour envoyer :
// Authorization: Bearer <token>
const REFRESH_TOKEN_KEY = 'paymedia.refresh_token';

// Session utilisateur utilisée par le frontend pour restaurer la connexion.
const SESSION_KEY = 'web_editeur.session';


// -----------------------------------------------------------------------------
// OUTILS
// -----------------------------------------------------------------------------

function normalizeRole(role: string): TeamRole {

    const roles: TeamRole[] = [
         'editor',
        'agency_editor',
        'agency_admin',
        'agency_validator',
        'admin'
    ];

    return roles.includes(role as TeamRole)
        ? role as TeamRole
        : 'editor';
}

function mapUserToProfile(
    user: LoginResponse['data']['user']
): EditorProfile {

    return {
        id: String(user.id),

        ulid: user.ulid,

        username: user.username,

        email: user.email,

        role: normalizeRole(
            user.effectiveRole || user.role
        ),

        displayName: user.username,

        organization: 'PayMedia',

        memberSince: user.createdAt,

        avatarUrl: undefined,

        // Ces informations ne sont pas encore retournées
        // par le contrat d'authentification fourni.
        walletBalance: 0,

        walletCurrency: 'XAF',
    };
}

function saveSession(
    response: LoginResponse | GoogleAuthResponse
): AuthSession {

    const data = response.data;

    const session: AuthSession = {
        user: mapUserToProfile(data.user),

        token: data.accessToken,

        refreshToken: data.refreshToken,

        expiresIn: data.expiresIn,
    };

    // Token d'accès.
    setAccessToken(
        data.accessToken
    );

    // Refresh token.
    localStorage.setItem(
        REFRESH_TOKEN_KEY,
        data.refreshToken
    );

    // Session frontend.
    sessionStorage.setItem(
        SESSION_KEY,
        JSON.stringify(session)
    );

    return session;
}


// -----------------------------------------------------------------------------
// REPOSITORY
// -----------------------------------------------------------------------------

export const authRepository = {

    // =========================================================================
    // LOGIN
    // =========================================================================

    /**
     * Connexion classique avec email + mot de passe.
     *
     * POST /api/v1/core/auth/login
     */
    async login(
        credentials: LoginCredentials
    ): Promise<AuthSession> {

        const response =
            await apiClient.post<LoginResponse>(
                '/auth/login',
                {
                    email: credentials.email
                        .trim()
                        .toLowerCase(),

                    password: credentials.password,
                }
            );

        if (!response.success) {
            throw new Error(
                response.message ||
                'Échec de la connexion.'
            );
        }

        return saveSession(response);
    },


    // =========================================================================
    // REGISTER
    // =========================================================================


    async register(
        credentials: RegisterCredentials
    ): Promise<AuthSession> {

        const payload: RegisterInput = {

            username:
                credentials.username.trim(),

            email:
                credentials.email
                    .trim()
                    .toLowerCase(),

            password:
            credentials.password,

            countryCode:
            credentials.country_code,

            whatsappPhone:
                credentials.phone.trim(),

            // IMPORTANT :
            // Le backend nous a indiqué que le rôle attendu
            // pour cette application est "editor".
            role: 'editor',
        };


        const response =
            await apiClient.post<RegisterResponse>(
                '/auth/register',
                payload
            );


        if (!response.success) {
            throw new Error(
                response.message ||
                "Échec de l'inscription."
            );
        }


        // D'après le contrat actuellement fourni,
        // register retourne l'utilisateur mais pas de AuthData
        // contenant un accessToken.
        //
        // On effectue donc une connexion immédiatement après
        // l'inscription.
        return this.login({
            email: credentials.email,
            password: credentials.password,
        });
    },


    // =========================================================================
    // GOOGLE OAUTH
    // =========================================================================

    /**
     * Authentification Google.
     *
     * Endpoint fourni par le backend :
     *
     * POST /api/v1/core/auth/google
     *
     * Le backend attend :
     *
     * {
     *   email,
     *   username,
     *   providerId,
     *   targetApp
     * }
     *
     * IMPORTANT :
     *
     * Cette méthode ne lance PAS Google directement.
     *
     * Elle reçoit les informations Google déjà obtenues
     * par le mécanisme OAuth de l'application.
     */
    async googleLogin(
        email: string,
        username: string,
        providerId: string
    ): Promise<AuthSession> {

        const response =
            await apiClient.post<GoogleAuthResponse>(
                '/auth/google',
                {
                    email:
                        email
                            .trim()
                            .toLowerCase(),

                    username:
                        username.trim(),

                    providerId,

                    // Valeur confirmée pour le Web Éditeur.
                    targetApp: 'web_editor',
                }
            );


        if (!response.success) {
            throw new Error(
                response.message ||
                'Échec de la connexion avec Google.'
            );
        }


        return saveSession(response);
    },


    // =========================================================================
    // FORGOT PASSWORD
    // =========================================================================


    async forgotPassword(
        input: ForgotPasswordInput
    ): Promise<ForgotPasswordResponse> {

        const response =
            await apiClient.post<ForgotPasswordResponse>(
                '/auth/forgot-password',
                {
                    email:
                        input.email
                            .trim()
                            .toLowerCase(),
                }
            );


        if (!response.success) {
            throw new Error(
                response.message ||
                'Impossible de traiter la demande.'
            );
        }


        return response;
    },


    // =========================================================================
    // RESET PASSWORD
    // =========================================================================


    async resetPassword(
        input: ResetPasswordInput
    ): Promise<ForgotPasswordResponse> {

        const response =
            await apiClient.post<ForgotPasswordResponse>(
                '/auth/reset-password',
                {
                    token:
                    input.token,

                    newPassword:
                    input.newPassword,
                }
            );


        if (!response.success) {
            throw new Error(
                response.message ||
                'Impossible de réinitialiser le mot de passe.'
            );
        }


        return response;
    },


    // =========================================================================
    // RESTORE SESSION
    // =========================================================================

    /**
     * Restaure la session locale après un refresh de la page.
     *
     * Pour le moment, cette méthode ne fait pas encore d'appel
     * à /refresh.
     *
     * Elle récupère simplement la session sauvegardée.
     */
    async getSession(): Promise<AuthSession | null> {

        const raw =
            sessionStorage.getItem(
                SESSION_KEY
            );


        if (!raw) {
            return null;
        }


        try {

            return JSON.parse(
                raw
            ) as AuthSession;

        } catch {

            await this.logout();

            return null;
        }
    },


    // =========================================================================
    // LOGOUT
    // =========================================================================

    async logout(): Promise<void> {

        clearAccessToken();

        localStorage.removeItem(
            REFRESH_TOKEN_KEY
        );

        sessionStorage.removeItem(
            SESSION_KEY
        );
    },
};