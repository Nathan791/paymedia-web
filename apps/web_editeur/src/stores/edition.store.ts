// src/stores/edition.store.ts
import { create } from 'zustand';
import { editionService } from '@/services/edition.service';
import { EditionDraftInput, EditionWithContents } from '@/models';
import { useAuthStore } from '@/stores/auth.store';

interface EditionState {
    editions: EditionWithContents[];
    currentEdition: EditionWithContents | null;
    isLoading: boolean;
    isSaving: boolean;
    error: string | null;

    fetchEditions: () => Promise<void>;
    fetchEdition: (id: string) => Promise<void>;
    createEdition: (input: EditionDraftInput) => Promise<void>;
    addContent: (editionId: string, contentId: string) => Promise<void>;
    removeContent: (editionId: string, contentId: string) => Promise<void>;
    publish: (id: string) => Promise<void>;
    archive: (id: string) => Promise<void>;
    restore: (id: string) => Promise<void>;
    removeEdition: (id: string) => Promise<void>;
    clearError: () => void;
}

export const useEditionStore = create<EditionState>((set, get) => ({
    editions: [],
    currentEdition: null,
    isLoading: false,
    isSaving: false,
    error: null,

    fetchEditions: async () => {
        set({ isLoading: true, error: null });
        try {
            const editions = await editionService.list();
            set({ editions, isLoading: false });
        } catch (error: any) {
            set({ error: error.message || 'Erreur de chargement.', isLoading: false });
        }
    },

    fetchEdition: async (id) => {
        set({ isLoading: true, error: null, currentEdition: null });
        try {
            const edition = await editionService.getById(id);
            set({ currentEdition: edition, isLoading: false });
        } catch (error: any) {
            set({ error: error.message || 'Édition introuvable.', isLoading: false });
            throw error;
        }
    },

    createEdition: async (input) => {
        set({ isSaving: true, error: null });
        try {
            const { user } = useAuthStore.getState();
            await editionService.create(input, user?.id ?? 'unknown', user?.displayName ?? 'Éditeur');
            set({ isSaving: false });
            await get().fetchEditions();
        } catch (error: any) {
            set({ error: error.message || 'Erreur lors de la création.', isSaving: false });
            throw error;
        }
    },

    addContent: async (editionId, contentId) => {
        set({ isSaving: true, error: null });
        try {
            await editionService.addContent(editionId, contentId);
            await get().fetchEdition(editionId);
            set({ isSaving: false });
        } catch (error: any) {
            set({ error: error.message || "Erreur lors de l'ajout.", isSaving: false });
            throw error;
        }
    },

    removeContent: async (editionId, contentId) => {
        set({ isSaving: true, error: null });
        try {
            await editionService.removeContent(editionId, contentId);
            await get().fetchEdition(editionId);
            set({ isSaving: false });
        } catch (error: any) {
            set({ error: error.message || 'Erreur lors du retrait.', isSaving: false });
            throw error;
        }
    },

    publish: async (id) => {
        set({ isSaving: true, error: null });
        try {
            await editionService.publish(id);
            await get().fetchEdition(id);
            set({ isSaving: false });
        } catch (error: any) {
            set({ error: error.message || 'Erreur lors de la publication.', isSaving: false });
            throw error;
        }
    },

    archive: async (id) => {
        set({ isSaving: true, error: null });
        try {
            await editionService.archive(id);
            await get().fetchEdition(id);
            set({ isSaving: false });
        } catch (error: any) {
            set({ error: error.message || "Erreur lors de l'archivage.", isSaving: false });
            throw error;
        }
    },

    restore: async (id) => {
        set({ isSaving: true, error: null });
        try {
            await editionService.restore(id);
            await get().fetchEdition(id);
            set({ isSaving: false });
        } catch (error: any) {
            set({ error: error.message || 'Erreur lors de la restauration.', isSaving: false });
            throw error;
        }
    },

    removeEdition: async (id) => {
        set({ isSaving: true, error: null });
        try {
            await editionService.remove(id);
            set((state) => ({ editions: state.editions.filter((e) => e.id !== id), isSaving: false }));
        } catch (error: any) {
            set({ error: error.message || 'Erreur lors de la suppression.', isSaving: false });
            throw error;
        }
    },

    clearError: () => set({ error: null }),
}));
