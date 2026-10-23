// src/models/auth.model.ts
//
// Contrats centraux de l'authentification du Web Éditeur.
// Les modèles frontend peuvent différer des modèles retournés par l'API ;
// le repository se charge de la conversion.

// =============================================================================
// RÔLES DE L'ESPACE ÉDITEUR
// =============================================================================

export type TeamRole =
    | 'editor'
    | 'admin'
    | 'agency_admin'
    | 'agency_editor'
    | 'agency_validator';

export const TEAM_ROLE_LABELS: Record<TeamRole, string> = {
    admin: 'Administrateur',
    editor: 'Éditeur',
    agency_admin: 'Administrateur agence',
    agency_editor: 'Éditeur agence',
    agency_validator: 'Validateur agence',
};

/** Vérifie qu'une chaîne venant de l'API est bien un rôle connu. */
export const isTeamRole = (value: string): value is TeamRole =>
    Object.prototype.hasOwnProperty.call(TEAM_ROLE_LABELS, value);

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
    admin: {
        canCreateContent: true,
        canEditOwnContent: true,
        canEditAnyContent: true,
        canReview: true,
        canPublish: true,
        canManageTeam: true,
        canViewRevenue: true,
        canManageSettings: true,
    },
    agency_admin: {
        canCreateContent: true,
        canEditOwnContent: true,
        canEditAnyContent: true,
        canReview: true,
        canPublish: true,
        canManageTeam: true,
        canViewRevenue: true,
        canManageSettings: true,
    },
    editor: {
        canCreateContent: true,
        canEditOwnContent: true,
        canEditAnyContent: false,
        canReview: false,
        canPublish: true,
        canManageTeam: false,
        canViewRevenue: false,
        canManageSettings: false,
    },
    agency_editor: {
        canCreateContent: true,
        canEditOwnContent: true,
        canEditAnyContent: false,
        canReview: false,
        canPublish: false,
        canManageTeam: false,
        canViewRevenue: false,
        canManageSettings: false,
    },
    agency_validator: {
        canCreateContent: false,
        canEditOwnContent: false,
        canEditAnyContent: false,
        canReview: true,
        canPublish: true,
        canManageTeam: false,
        canViewRevenue: false,
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
// FORMULAIRES
// =============================================================================

export interface LoginCredentials {
    email: string;
    password: string;
}

// Le repository convertit phone/country_code/currency vers whatsappPhone/countryCode.
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

// =============================================================================
// MOT DE PASSE OUBLIÉ / RESET
// =============================================================================
// POST /api/v1/core/auth/forgot-password  { "email": "..." }

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