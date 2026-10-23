// src/models/user.model.ts

// =============================================================================
// RÔLES
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
// UTILISATEUR
// =============================================================================

export interface User {
    id: number;
    ulid: string;

    username: string;
    email: string;

    role: string;
    effectiveRole?: string;

    whatsappPhone?: string;
    countryCode?: string;

    isVerified?: boolean;
    isActive?: boolean;

    lastLoginAt?: string;
    createdAt?: string;
    updatedAt?: string;
    deletedAt?: string | null;

    walletId?: number;

    wallet?: {
        ulid: string;
        balance: string;
        currency: string;
    };

    roles?: string[];
}

// Données du formulaire d'inscription
export interface RegisterInput {
    username: string;
    email: string;
    password: string;
    phone: string;
    country_code: string;
    currency: string;
}