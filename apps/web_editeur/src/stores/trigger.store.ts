// src/stores/trigger.store.ts
import { create } from 'zustand';
import { triggerService } from '@/services/trigger.service';
import { Trigger } from '@/models';

interface TriggerState {
    triggers: Trigger[];
    isLoading: boolean;
    error: string | null;
    fetchTriggers: () => Promise<void>;
    togglePause: (trigger: Trigger) => Promise<void>;
}

export const useTriggerStore = create<TriggerState>((set, get) => ({
    triggers: [],
    isLoading: false,
    error: null,

    fetchTriggers: async () => {
        set({ isLoading: true, error: null });
        try {
            const triggers = await triggerService.list();
            set({ triggers, isLoading: false });
        } catch (error: any) {
            set({ error: error.message || 'Erreur de chargement.', isLoading: false });
        }
    },

    togglePause: async (trigger) => {
        try {
            const updated = trigger.status === 'active'
                ? await triggerService.pause(trigger.id)
                : await triggerService.activate(trigger.id);
            set({ triggers: get().triggers.map((t) => (t.id === trigger.id ? updated : t)) });
        } catch (error: any) {
            set({ error: error.message || "Erreur lors de la mise à jour." });
        }
    },
}));
