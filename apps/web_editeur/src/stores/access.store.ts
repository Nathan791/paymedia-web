// src/stores/access.store.ts
import { create } from 'zustand';
import { accessService } from '@/services/access.service';
import { CreateAccessPointInput } from '@/repositories/access.repository';
import { AccessPoint } from '@/models';

interface AccessState {
    accessPoints: AccessPoint[];
    isLoading: boolean;
    isSaving: boolean;
    error: string | null;
    fetchAccessPoints: (contentId?: string) => Promise<void>;
    createAccessPoint: (input: CreateAccessPointInput) => Promise<AccessPoint>;
    togglePause: (accessPoint: AccessPoint) => Promise<void>;
    clearError: () => void;
}

export const useAccessStore = create<AccessState>((set, get) => ({
    accessPoints: [],
    isLoading: false,
    isSaving: false,
    error: null,

    fetchAccessPoints: async (contentId) => {
        set({ isLoading: true, error: null });
        try {
            const accessPoints = await accessService.list(contentId);
            set({ accessPoints, isLoading: false });
        } catch (error: any) {
            set({ error: error.message || 'Erreur de chargement.', isLoading: false });
        }
    },

    createAccessPoint: async (input) => {
        set({ isSaving: true, error: null });
        try {
            const accessPoint = await accessService.create(input);
            set((state) => ({ accessPoints: [accessPoint, ...state.accessPoints], isSaving: false }));
            return accessPoint;
        } catch (error: any) {
            set({ error: error.message || 'Erreur lors de la création.', isSaving: false });
            throw error;
        }
    },

    togglePause: async (accessPoint) => {
        try {
            const updated = accessPoint.status === 'active'
                ? await accessService.pause(accessPoint.id)
                : await accessService.activate(accessPoint.id);
            set({ accessPoints: get().accessPoints.map((a) => (a.id === accessPoint.id ? updated : a)) });
        } catch (error: any) {
            set({ error: error.message || "Erreur lors de la mise à jour." });
        }
    },

    clearError: () => set({ error: null }),
}));
