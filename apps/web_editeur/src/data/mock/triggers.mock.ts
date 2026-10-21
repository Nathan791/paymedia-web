// src/data/mock/triggers.mock.ts

export interface Trigger {
    id: string;
    type: 'qr_code' | 'audio_watermark' | 'short_code' | string;
    label: string;
    code: string;
    contentId: string;
    contentTitle: string;
    campaign: string;
    status: 'active' | 'paused' | 'expired' | string;
    createdAt: string;
    expiresAt: string | null;
    stats: {
        scans: number;
        conversions: number;
    };
}

export const MOCK_TRIGGERS: Trigger[] = [
    {
        id: 'trg-001',
        type: 'qr_code',
        label: 'Une du journal — édition du 04/06',
        code: 'PM-QR-48213',
        contentId: 'cnt-001',
        contentTitle: "L'édition spéciale : 30 ans d'indépendance économique",
        campaign: 'Lancement édition spéciale',
        status: 'active',
        createdAt: '2026-06-04T15:30:00.000Z',
        expiresAt: null,
        stats: { scans: 3840, conversions: 946 },
    },
    {
        id: 'trg-002',
        type: 'audio_watermark',
        label: 'Spot radio matinal — Voix du marché',
        code: 'PM-AUD-91002',
        contentId: 'cnt-002',
        contentTitle: 'Podcast — Les voix du marché central',
        campaign: 'Campagne radio mai',
        status: 'active',
        createdAt: '2026-05-20T10:00:00.000Z',
        expiresAt: '2026-09-20T10:00:00.000Z',
        stats: { scans: 2110, conversions: 612 },
    },
    {
        id: 'trg-003',
        type: 'short_code',
        label: 'Affiche abribus — Centre-ville',
        code: 'PM4821',
        contentId: 'cnt-001',
        contentTitle: "L'édition spéciale : 30 ans d'indépendance économique",
        campaign: 'Lancement édition spéciale',
        status: 'paused',
        createdAt: '2026-06-10T09:00:00.000Z',
        expiresAt: null,
        stats: { scans: 540, conversions: 78 },
    },
    {
        id: 'trg-004',
        type: 'qr_code',
        label: 'Bandeau TV — soirée sport',
        code: 'PM-QR-30044',
        contentId: 'cnt-006',
        contentTitle: 'Rétrospective — La saison sportive 2025',
        campaign: 'Fin de saison 2025',
        status: 'expired',
        createdAt: '2025-12-22T09:00:00.000Z',
        expiresAt: '2026-02-28T00:00:00.000Z',
        stats: { scans: 1980, conversions: 289 },
    },
];