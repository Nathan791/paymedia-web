// src/models/content.model.ts
//
// ============================================================================
// MODÈLES DU MODULE CONTENU
// ============================================================================
//
// Ce fichier contient les contrats utilisés par le Web Éditeur.
//
// IMPORTANT :
// Les modèles API et les modèles utilisés par l'interface ne sont pas
// nécessairement identiques.
//
// L'API réelle de PayMedia retourne actuellement pour "my-contents" :
//
// {
//     ulid, title, description, mediaType, price, isPremium,
//     status, thumbnailUrl, createdAt, category
// }
//
// Nous conservons donc un modèle frontend suffisamment riche pour faire
// évoluer progressivement le module, mais les données réellement absentes
// de l'API ne sont plus inventées lors du mapping.
// ============================================================================

import type { TeamRole } from './auth.model';

// ============================================================================
// TYPES DE MÉDIA
// ============================================================================

export type ContentMediaType = 'epub' | 'audio' | 'video';

// ============================================================================
// STATUTS
// ============================================================================

export type ContentStatus =
    | 'draft'
    | 'pending_review'
    | 'correction_requested'
    | 'approved'
    | 'scheduled'
    | 'published'
    | 'archived';

// ============================================================================
// CATÉGORIE
// ============================================================================

export interface ContentCategory {
    id?: string;
    name: string;
    slug: string;
}

// ============================================================================
// ASSET LOCAL
// ============================================================================
// Utilisé lorsque nous avons besoin de représenter un fichier côté frontend.

export interface ContentAsset {
    fileName: string;
    fileUrl: string;
    fileSizeBytes: number;
    mimeType: string;
}

// ============================================================================
// HISTORIQUE
// ============================================================================

export type ContentHistoryAction =
    | 'created'
    | 'edited'
    | 'submitted'
    | 'correction_requested'
    | 'approved'
    | 'scheduled'
    | 'published'
    | 'archived'
    | 'restored';

export interface ContentHistoryEntry {
    id: string;
    action: ContentHistoryAction;
    actorId: string;
    actorName: string;
    comment: string | null;
    timestamp: string;
}

// ============================================================================
// CONTENU
// ============================================================================

export interface Content {
    id: string;
    ulid: string;
    title: string;
    slug: string;
    summary: string;
    description: string;
    mediaType: ContentMediaType;
    asset: ContentAsset | null;
    coverUrl: string | null;
    category: ContentCategory | null;
    tags: string[];
    isPremium: boolean;
    price: number;
    currency: string;
    freePreviewUnits: number;
    status: ContentStatus;

    // Workflow éditorial
    version: number;
    correctionComment: string | null;
    reviewerId: string | null;
    reviewerName: string | null;
    history: ContentHistoryEntry[];

    // Dates
    createdAt: string;
    updatedAt: string;
    scheduledAt: string | null;
    publishedAt: string | null;
    archivedAt: string | null;

    // Auteur
    authorId: string;
    authorName: string;

    // Statistiques
    stats: {
        views: number;
        purchases: number;
        conversionRate: number;
        revenue: number;
        likes?: number;
    };
}

// ============================================================================
// DONNÉES NÉCESSAIRES À LA CRÉATION
// ============================================================================
// Ce modèle représente uniquement les données métier.
// Les fichiers sont transmis séparément au repository sous forme de File.

export interface ContentDraftInput {
    title: string;
    description: string;
    mediaType: ContentMediaType;
    categoryId: string;        // garanti non nul par validate() dans la page
    tags: string[];
    isPremium: boolean;
    price: number;
    freePreviewUnits: number;  // pages (epub) ou durée (audio, vidéo)
}

// ============================================================================
// RÉPONSE API "MY CONTENTS"
// ============================================================================

export interface ApiContentCategory {
    name: string;
    slug: string;
}

export interface ApiContent {
    ulid: string;
    title: string;
    description: string;
    mediaType: ContentMediaType;
    price: string | number;
    freeStartPage?: number;
    freeEndPage?: number;
    freePreviewDuration?: number;
    isPremium: boolean;
    status: string;
    thumbnailUrl: string | null;
    createdAt: string;
    category: ApiContentCategory | null;
}

// ============================================================================
// RÉPONSE LISTE
// ============================================================================

export interface MyContentsResponse {
    success: boolean;
    data: {
        items: ApiContent[];
    };
    message?: string;
}

// ============================================================================
// RÉPONSE CRÉATION
// ============================================================================

export interface CreateContentResponse {
    success: boolean;
    data: ApiContent;
    message: string;
}

// ============================================================================
// LIBELLÉS
// ============================================================================

export const CONTENT_STATUS_LABELS: Record<ContentStatus, string> = {
    draft: 'Brouillon',
    pending_review: 'En révision',
    correction_requested: 'Correction demandée',
    approved: 'Approuvé',
    scheduled: 'Programmé',
    published: 'Publié',
    archived: 'Archivé',
};

// ============================================================================
// COULEURS
// ============================================================================

export const CONTENT_STATUS_COLORS: Record<ContentStatus, string> = {
    draft: 'gray',
    pending_review: 'gold',
    correction_requested: 'red',
    approved: 'teal',
    scheduled: 'blue',
    published: 'forest',
    archived: 'dark',
};

// ============================================================================
// STATUTS MODIFIABLES
// ============================================================================

export const EDITABLE_STATUSES: ContentStatus[] = [
    'draft',
    'correction_requested',
    'published',
];

// ============================================================================
// TRANSITIONS
// ============================================================================

export const ALLOWED_TRANSITIONS: Record<ContentStatus, ContentStatus[]> = {
    draft: ['pending_review'],
    pending_review: ['approved', 'correction_requested'],
    correction_requested: ['pending_review'],
    approved: ['published', 'scheduled'],
    scheduled: ['published', 'draft'],
    published: ['archived', 'pending_review'],
    archived: ['draft'],
};

// ============================================================================
// PERMISSIONS DE TRANSITION
// ============================================================================

export const TRANSITION_PERMISSIONS: Record<ContentStatus, TeamRole[]> = {
    draft: ['editor', 'agency_editor', 'agency_admin', 'agency_validator'],
    pending_review: ['editor', 'agency_editor', 'agency_admin', 'agency_validator'],
    correction_requested: ['agency_editor', 'agency_admin'],
    approved: ['agency_validator', 'agency_editor', 'agency_admin'],
    scheduled: ['editor', 'agency_editor', 'agency_admin'],
    published: ['editor', 'agency_editor', 'agency_admin', 'agency_validator'],
    archived: ['agency_editor', 'agency_admin'],
};

// ============================================================================
// VALIDATION D'UNE TRANSITION
// ============================================================================

export function canTransition(
    from: ContentStatus,
    to: ContentStatus,
    role: TeamRole,
): boolean {
    return (
        ALLOWED_TRANSITIONS[from].includes(to) &&
        TRANSITION_PERMISSIONS[to].includes(role)
    );
}