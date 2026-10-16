// src/models/auth.model.ts
//
// Contrats centraux de l'authentification du Web Éditeur.
//
// Ce fichier contient :
// - les rôles et permissions de l'espace éditeur ;
// - le profil utilisateur utilisé par l'interface ;
// - les données des formulaires ;
// - les contrats correspondant aux réponses de l'API Core Auth ;
// - les contrats spécifiques à Google OAuth ;
// - les contrats de récupération du mot de passe.
//
// IMPORTANT :
// Les modèles frontend peuvent être différents des modèles retournés
// directement par l'API. Le repository se charge de faire la conversion.
//

// =============================================================================
// RÔLES DE L'ESPACE ÉDITEUR
// =============================================================================

export type TeamRole =
    | 'owner'
    | 'media_admin'
    | 'editor_in_chief'
    | 'journalist'
    | 'finance';

export const TEAM_ROLE_LABELS: Record<TeamRole, string> = {
    owner: 'Propriétaire',
    media_admin: 'Administrateur média',
    editor_in_chief: 'Rédacteur en chef',
    journalist: 'Journaliste',
    finance: 'Finance',
};

// =============================================================================
// PERMISSIONS
// =============================================================================

export interface RolePermissions {
    canCreateContent: boolean;
    canEditOwnContent: boolean;
    canEditAnyContent: boolean;
    canReview: boolean;
    canPublish: boolean;
    canManageTeam: boolean;
    canViewRevenue: boolean;
    canManageSettings: boolean;
}

export const ROLE_PERMISSIONS: Record<TeamRole, RolePermissions> = {
    owner: {
        canCreateContent: true,
        canEditOwnContent: true,
        canEditAnyContent: true,
        canReview: true,
        canPublish: true,
        canManageTeam: true,
        canViewRevenue: true,
        canManageSettings: true,
    },

    media_admin: {
        canCreateContent: true,
        canEditOwnContent: true,
        canEditAnyContent: true,
        canReview: true,
        canPublish: true,
        canManageTeam: true,
        canViewRevenue: true,
        canManageSettings: true,
    },

    editor_in_chief: {
        canCreateContent: true,
        canEditOwnContent: true,
        canEditAnyContent: true,
        canReview: true,
        canPublish: true,
        canManageTeam: false,
        canViewRevenue: true,
        canManageSettings: false,
    },

    journalist: {
        canCreateContent: true,
        canEditOwnContent: true,
        canEditAnyContent: false,
        canReview: false,
        canPublish: true,
        canManageTeam: false,
        canViewRevenue: false,
        canManageSettings: false,
    },

    finance: {
        canCreateContent: false,
        canEditOwnContent: false,
        canEditAnyContent: false,
        canReview: false,
        canPublish: false,
        canManageTeam: false,
        canViewRevenue: true,
        canManageSettings: false,
    },
};

// =============================================================================
// PROFIL UTILISÉ PAR LE WEB ÉDITEUR
// =============================================================================


export interface EditorProfile {
    id: string;
    ulid: string;
    username: string;
    email: string;
    role: TeamRole;
    displayName: string;
    avatarUrl?: string;
    organization: string;
    memberSince: string;
    walletBalance: number;
    walletCurrency: string;
}

// =============================================================================
// FORMULAIRE LOGIN
// =============================================================================

export interface LoginCredentials {
    email: string;
    password: string;
}

// =============================================================================
// FORMULAIRE REGISTER
// =============================================================================
//
// Le frontend utilise actuellement phone/country_code/currency.
// Le repository convertit ces propriétés vers le contrat backend :
// whatsappPhone/countryCode.
// =============================================================================

export interface RegisterCredentials {
    username: string;
    email: string;
    phone: string;
    country_code: string;
    currency: string;
    password: string;
}

// =============================================================================
// GOOGLE AUTH
// =============================================================================

export interface GoogleAuthInput {
    email: string;
    username: string;
    providerId: string;
    targetApp: 'web_editor';
}


// -----------------------------------------------------------------------------
// FORGOT PASSWORD
// -----------------------------------------------------------------------------
//
// Le backend attend simplement l'adresse e-mail du compte.
// Exemple :
//
// POST /api/v1/core/auth/forgot-password
//
// Body :
// {
//     "email": "utilisateur@gmail.com"
// }
// -----------------------------------------------------------------------------

export interface ForgotPasswordInput {
    email: string;
}

export interface ForgotPasswordResponse {
    success: boolean;
    message: string;
}

export interface ResetPasswordInput {
    token: string;
    newPassword: string;
}

export interface ResetPasswordResponse {
    success: boolean;
    message: string;
}

// -----------------------------------------------------------------------------
// GOOGLE OAUTH
// -----------------------------------------------------------------------------
//
// D'après le contrat que tu m'as fourni, l'API Google attend :
//
// {
//     "email": "socialuser@gmail.com",
//     "username": "SocialUser",
//     "providerId": "google_oauth_123456789",
//     "targetApp": "web_editor"
// }
// -----------------------------------------------------------------------------

export interface GoogleAuthInput {
    email: string;
    username: string;
    providerId: string;
    targetApp: 'web_editor';
}

export interface GoogleAuthResponse {
    success: boolean;
    data: AuthData;
    message: string;
}




// =============================================================================
// RESET PASSWORD
// =============================================================================


export interface ResetPasswordInput {
    token: string;
    newPassword: string;
}

// =============================================================================
// SESSION FRONTEND
// =============================================================================


export interface AuthSession {
    user: EditorProfile;
    token: string;
    refreshToken?: string;
    expiresIn?: number;
}

// =============================================================================
// CONTRATS API AUTH
// =============================================================================

export interface AuthUser {
    id: number;
    ulid: string;
    username: string;
    email: string;
    whatsappPhone: string;
    countryCode: string;
    role: string;
    isVerified: boolean;
    isActive: boolean;
    lastLoginAt: string | null;
    createdAt: string;
    updatedAt: string;
    deletedAt: string | null;
    walletId?: number;
    effectiveRole: string;
}

export interface LoginInput {
    email: string;
    password: string;
}

export interface RegisterInput {
    username: string;
    email: string;
    password: string;
    countryCode: string;
    whatsappPhone: string;
    role: 'editor';
}

export interface AuthData {
    accessToken: string;
    refreshToken: string;
    expiresIn: number;
    targetApp: string;
    user: AuthUser;
    accessJti?: string;
    refreshJti?: string;
}

export interface LoginResponse {
    success: boolean;
    data: AuthData;
    message: string;
}

export interface RegisterResponse {
    success: boolean;
    data: AuthUser;
    message: string;
}

export interface GoogleAuthResponse {
    success: boolean;
    data: AuthData;
    message: string;
}