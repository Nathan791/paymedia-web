// src/repositories/trigger.repository.ts
import { Trigger, TriggerStatus } from '@/models';
import { MOCK_TRIGGERS } from '@/data/mock';
import { delay } from './_utils';

let triggersDb: Trigger[] = MOCK_TRIGGERS.map((t) => ({ ...t }));

export const triggerRepository = {
    async list(): Promise<Trigger[]> {
        await delay(null);
        return [...triggersDb].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    },

    async setStatus(id: string, status: TriggerStatus): Promise<Trigger> {
        await delay(null, 350);
        const index = triggersDb.findIndex((t) => t.id === id);
        if (index === -1) throw new Error('Déclencheur introuvable.');
        const updated = { ...triggersDb[index], status };
        triggersDb = [...triggersDb.slice(0, index), updated, ...triggersDb.slice(index + 1)];
        return { ...updated };
    },
};
