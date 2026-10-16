// src/models/access.model.ts
//
// Un "point d'accès" est l'objet physique/numérique qui permet à un lecteur
// de découvrir un contenu depuis un média traditionnel : QR code sur une
// affiche, code court tapé sur mobile, ou empreinte audio radio/TV.
//
// ⚠️ Renommage volontaire depuis "Trigger" (terme technique peu parlant pour
// un journaliste) — voir la demande produit d'origine. Le concept reste
// exactement celui du cahier des charges (déclencheur QR/short-code/audio),
// seul le nom change pour rester compréhensible sans vocabulaire technique.

export type AccessPointType = 'qr_code' | 'short_code' | 'audio_watermark';

export type AccessPointStatus = 'active' | 'paused' | 'expired';

export interface AccessPoint {
    id: string;
    type: AccessPointType;
    label: string;               // ex: "Affiche Métro — Campagne Juillet"
    code: string;                 // le short-code ou l'identifiant technique
    contentId: string;
    contentTitle: string;
    campaign: string | null;
    status: AccessPointStatus;
    createdAt: string;
    expiresAt: string | null;
    // Entonnoir de découverte (voir Master Prompt §18/§23) : un scan ne
    // devient pas automatiquement une visite (lien rompu, QR endommagé...),
    // une visite ne devient pas automatiquement un achat.
    stats: {
        scans: number;
        visits: number;
        purchases: number;
    };
}

export const ACCESS_POINT_TYPE_LABELS: Record<AccessPointType, string> = {
    qr_code: 'QR Code',
    short_code: 'Code court',
    audio_watermark: 'Empreinte audio',
};

export const ACCESS_POINT_STATUS_LABELS: Record<AccessPointStatus, string> = {
    active: 'Actif',
    paused: 'En pause',
    expired: 'Expiré',
};

export const ACCESS_POINT_STATUS_COLORS: Record<AccessPointStatus, string> = {
    active: 'forest',
    paused: 'gray',
    expired: 'red',
};

// Taux de conversion scan → achat, utilisé partout où on affiche la
// performance d'un point d'accès (liste, détail, dashboard).
export function conversionRate(stats: AccessPoint['stats']): number {
    if (stats.scans === 0) return 0;
    return Math.round((stats.purchases / stats.scans) * 10000) / 100;
}
