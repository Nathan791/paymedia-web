// src/models/trigger.model.ts
//
// Un "déclencheur" est l'objet physique/numérique qui permet à un lecteur de
// découvrir un contenu depuis un média traditionnel : QR code sur une
// affiche, short-code tapé sur mobile, ou empreinte audio radio/TV.

export type TriggerType = 'qr_code' | 'short_code' | 'audio_watermark';

export type TriggerStatus = 'active' | 'paused' | 'expired';

export interface Trigger {
    id: string;
    type: TriggerType;
    label: string;              // ex: "Affiche Métro — Campagne Juillet"
    code: string;                // le short-code ou l'identifiant technique
    contentId: string;
    contentTitle: string;
    campaign: string | null;
    status: TriggerStatus;
    createdAt: string;
    expiresAt: string | null;
    stats: {
        scans: number;
        conversions: number; // scans ayant mené à un achat/accès
    };
}

export const TRIGGER_TYPE_LABELS: Record<TriggerType, string> = {
    qr_code: 'QR Code',
    short_code: 'Short-code',
    audio_watermark: 'Empreinte audio',
};

export const TRIGGER_STATUS_COLORS: Record<TriggerStatus, string> = {
    active: 'emerald',
    paused: 'gray',
    expired: 'red',
};
