// src/repositories/access.repository.ts
import { AccessPoint, AccessPointStatus, AccessPointType } from '@/models';
import { MOCK_ACCESS_POINTS } from '@/data/mock';
import { delay, generateId } from './_utils';

let accessPointsDb: AccessPoint[] = MOCK_ACCESS_POINTS.map((t) => ({ ...t }));

// Génère un code lisible et unique selon le type — l'éditeur n'a jamais à
// choisir/saisir cet identifiant technique lui-même (voir Master Prompt §21 :
// "il doit être unique, lié au contenu, facilement identifiable").
function generateCode(type: AccessPointType): string {
    const random = Math.random().toString(36).slice(2, 7).toUpperCase();
    if (type === 'qr_code') return `PM-QR-${random}`;
    if (type === 'audio_watermark') return `PM-AUD-${random}`;
    return `PM${random}`;
}

export interface CreateAccessPointInput {
    type: AccessPointType;
    label: string;
    contentId: string;
    contentTitle: string;
    campaign: string | null;
    expiresAt: string | null;
}

export const accessRepository = {
    async list(contentId?: string): Promise<AccessPoint[]> {
        await delay(null);
        let items = [...accessPointsDb];
        if (contentId) items = items.filter((a) => a.contentId === contentId);
        return items.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    },

    async getById(id: string): Promise<AccessPoint> {
        await delay(null, 200);
        const found = accessPointsDb.find((a) => a.id === id);
        if (!found) throw new Error('Point d\'accès introuvable.');
        return { ...found };
    },

    async create(input: CreateAccessPointInput): Promise<AccessPoint> {
        await delay(null, 500);
        const accessPoint: AccessPoint = {
            id: generateId('acc'),
            type: input.type,
            label: input.label,
            code: generateCode(input.type),
            contentId: input.contentId,
            contentTitle: input.contentTitle,
            campaign: input.campaign,
            status: 'active',
            createdAt: new Date().toISOString(),
            expiresAt: input.expiresAt,
            stats: { scans: 0, visits: 0, purchases: 0 },
        };
        accessPointsDb = [accessPoint, ...accessPointsDb];
        return { ...accessPoint };
    },

    async setStatus(id: string, status: AccessPointStatus): Promise<AccessPoint> {
        await delay(null, 350);
        const index = accessPointsDb.findIndex((a) => a.id === id);
        if (index === -1) throw new Error('Point d\'accès introuvable.');
        const updated = { ...accessPointsDb[index], status };
        accessPointsDb = [...accessPointsDb.slice(0, index), updated, ...accessPointsDb.slice(index + 1)];
        return { ...updated };
    },
};
