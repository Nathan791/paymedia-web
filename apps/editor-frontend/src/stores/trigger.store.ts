// src/stores/trigger.store.ts
import { create } from 'zustand';
import { triggerApi } from '@/api/trigger.api';
import { Trigger, TriggerStats } from '@/models';

interface TriggerState {
    triggers: Trigger[];
    currentTrigger: Trigger | null;
    triggerStats: TriggerStats | null;
    isLoading: boolean;
    error: string | null;

    fetchTriggers: () => Promise<void>;
    fetchTriggersByContent: (contentId: string) => Promise<void>;
    fetchTriggerStats: (id: string) => Promise<void>;
    createQR: (contentId: string) => Promise<Trigger>;
    createShortCode: (contentId: string) => Promise<Trigger>;
    createAudioWatermark: (contentId: string, audioFile: File) => Promise<Trigger>;
    deleteTrigger: (id: string) => Promise<void>;
    downloadQR: (id: string) => Promise<Blob>;
    clearError: () => void;
    reset: () => void;
}

const initialState = {
    triggers: [],
    currentTrigger: null,
    triggerStats: null,
    isLoading: false,
    error: null,
};

export const useTriggerStore = create<TriggerState>((set, _get) => ({
    ...initialState,

    fetchTriggers: async () => {
        set({ isLoading: true, error: null });
        try {
            const triggers = await triggerApi.getAll();
            set({ triggers, isLoading: false });
        } catch (error: any) {
            set({
                error: error.response?.data?.message || 'Erreur de chargement des triggers',
                isLoading: false,
            });
            throw error;
        }
    },

    fetchTriggersByContent: async (contentId: string) => {
        set({ isLoading: true, error: null });
        try {
            const triggers = await triggerApi.getByContent(contentId);
            set({ triggers, isLoading: false });
        } catch (error: any) {
            set({
                error: error.response?.data?.message || 'Erreur de chargement des triggers du contenu',
                isLoading: false,
            });
            throw error;
        }
    },

    fetchTriggerStats: async (id: string) => {
        set({ isLoading: true, error: null });
        try {
            const stats = await triggerApi.getStats(id);
            set({ triggerStats: stats, isLoading: false });
        } catch (error: any) {
            set({
                error: error.response?.data?.message || 'Erreur de chargement des statistiques',
                isLoading: false,
            });
            throw error;
        }
    },

    createQR: async (contentId: string) => {
        set({ isLoading: true, error: null });
        try {
            const trigger = await triggerApi.createQR(contentId);
            set((state) => ({
                triggers: [...state.triggers, trigger],
                isLoading: false,
            }));
            return trigger;
        } catch (error: any) {
            set({
                error: error.response?.data?.message || "Erreur de création du QR code",
                isLoading: false,
            });
            throw error;
        }
    },

    createShortCode: async (contentId: string) => {
        set({ isLoading: true, error: null });
        try {
            const trigger = await triggerApi.createShortCode(contentId);
            set((state) => ({
                triggers: [...state.triggers, trigger],
                isLoading: false,
            }));
            return trigger;
        } catch (error: any) {
            set({
                error: error.response?.data?.message || "Erreur de création du short-code",
                isLoading: false,
            });
            throw error;
        }
    },

    createAudioWatermark: async (contentId: string, audioFile: File) => {
        set({ isLoading: true, error: null });
        try {
            const trigger = await triggerApi.createAudioWatermark(contentId, audioFile);
            set((state) => ({
                triggers: [...state.triggers, trigger],
                isLoading: false,
            }));
            return trigger;
        } catch (error: any) {
            set({
                error: error.response?.data?.message || "Erreur de création du watermark audio",
                isLoading: false,
            });
            throw error;
        }
    },

    deleteTrigger: async (id: string) => {
        set({ isLoading: true, error: null });
        try {
            await triggerApi.delete(id);
            set((state) => ({
                triggers: state.triggers.filter((t) => t.id !== id),
                isLoading: false,
            }));
        } catch (error: any) {
            set({
                error: error.response?.data?.message || 'Erreur de suppression du trigger',
                isLoading: false,
            });
            throw error;
        }
    },

    downloadQR: async (id: string) => {
        set({ isLoading: true, error: null });
        try {
            const blob = await triggerApi.downloadQR(id);
            set({ isLoading: false });
            return blob;
        } catch (error: any) {
            set({
                error: error.response?.data?.message || 'Erreur de téléchargement du QR code',
                isLoading: false,
            });
            throw error;
        }
    },

    clearError: () => {
        set({ error: null });
    },

    reset: () => {
        set(initialState);
    },
}));