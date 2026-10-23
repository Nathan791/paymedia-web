// src/repositories/trigger.repository.ts
import { MOCK_TRIGGERS } from '@/data/mock/triggers.mock';
import { delay } from './_utils';
import { toTrigger, type Trigger, type TriggerStatus } from '@/models/trigger.model';

// Réexport pour les fichiers (service, etc.) qui importaient ces types d'ici
export type { Trigger, TriggerStatus };

// Chaque objet mock passe par toTrigger : type et status deviennent strictement typés
let triggersDb: Trigger[] = MOCK_TRIGGERS.map((t) => toTrigger(t));

const time = (d?: string) => (d ? new Date(d).getTime() : 0);

export const triggerRepository = {
    async list(): Promise<Trigger[]> {
        await delay(null);
        return [...triggersDb].sort((a, b) => time(b.createdAt) - time(a.createdAt));
    },

    async setStatus(id: string, status: TriggerStatus): Promise<Trigger> {
        await delay(null, 350);
        const index = triggersDb.findIndex((t) => t.id === id);
        if (index === -1) throw new Error('Déclencheur introuvable.');
        const updated: Trigger = { ...triggersDb[index], status };
        triggersDb = [...triggersDb.slice(0, index), updated, ...triggersDb.slice(index + 1)];
        return { ...updated };
    },
};