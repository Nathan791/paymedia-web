// src/models/trigger.model.ts

// =============================================================================
// TYPES
// =============================================================================

export type TriggerType = 'qr_code' | 'short_code' | 'audio_watermark';

export type TriggerStatus = 'active' | 'paused' | 'expired';

export interface TriggerStats {
    scans: number;
    conversions: number;
}

export interface Trigger {
    id: string;
    type: TriggerType;      // et non string : c'est ce qui corrige les 3 erreurs TS7053
    status: TriggerStatus;  // idem
    label: string;
    code: string;
    contentId?: string;
    contentTitle: string;
    stats: TriggerStats;
    createdAt?: string;
    expiresAt?: string | null;
}

// =============================================================================
// LIBELLÉS ET COULEURS
// =============================================================================

export const TRIGGER_TYPE_LABELS: Record<TriggerType, string> = {
    qr_code: 'QR code',
    short_code: 'Short-code',
    audio_watermark: 'Empreinte audio',
};

export const TRIGGER_STATUS_LABELS: Record<TriggerStatus, string> = {
    active: 'Actif',
    paused: 'En pause',
    expired: 'Expiré',
};

export const TRIGGER_STATUS_COLORS: Record<TriggerStatus, string> = {
    active: 'forest',
    paused: 'gold',
    expired: 'gray',
};

// =============================================================================
// VALIDATION (données venant de l'API ou des mocks, typées string)
// =============================================================================

const TRIGGER_TYPES = Object.keys(TRIGGER_TYPE_LABELS) as TriggerType[];
const TRIGGER_STATUSES = Object.keys(TRIGGER_STATUS_LABELS) as TriggerStatus[];

export const isTriggerType = (v: string): v is TriggerType =>
    (TRIGGER_TYPES as string[]).includes(v);

export const isTriggerStatus = (v: string): v is TriggerStatus =>
    (TRIGGER_STATUSES as string[]).includes(v);

/** Convertit un objet brut (API/mock) en Trigger typé strictement. */
export function toTrigger(raw: any): Trigger {
    return {
        ...raw,
        id: String(raw.id ?? raw.ulid),
        type: isTriggerType(raw.type) ? raw.type : 'qr_code',
        status: isTriggerStatus(raw.status) ? raw.status : 'expired',
        label: raw.label ?? '',
        code: raw.code ?? '',
        contentTitle: raw.contentTitle ?? '',
        stats: {
            scans: Number(raw.stats?.scans ?? 0),
            conversions: Number(raw.stats?.conversions ?? 0),
        },
    };
}