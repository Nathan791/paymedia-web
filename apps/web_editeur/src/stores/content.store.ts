import { create } from 'zustand';
import { contentService } from '@/services/content.service';
import type { Content, ContentCategory, ContentDraftInput } from '@/models';

interface ContentState {
    contents: Content[];
    categories: ContentCategory[];
    currentContent: Content | null;
    isLoading: boolean;
    isSaving: boolean;
    error: string | null;
    fetchContents: () => Promise<void>;
    fetchContent: (id: string) => Promise<void>;
    fetchCategories: () => Promise<void>;
    createContent: (input: ContentDraftInput, file: File, cover: File | null) => Promise<Content>;
    updateContent: (id: string, input: ContentDraftInput, file?: File | null, cover?: File | null) => Promise<Content>;
    deleteContent: (id: string) => Promise<void>;
    clearError: () => void;
}

function messageOf(error: unknown, fallback: string): string {
    return error instanceof Error && error.message ? error.message : fallback;
}

export const useContentStore = create<ContentState>((set) => ({
    contents: [],
    categories: [],
    currentContent: null,
    isLoading: false,
    isSaving: false,
    error: null,

    fetchContents: async () => {
        set({ isLoading: true, error: null });
        try {
            const contents = await contentService.listMyContents();
            set({ contents, isLoading: false, error: null });
        } catch (error) {
            set({ isLoading: false, error: messageOf(error, 'Erreur lors du chargement de vos contenus.') });
        }
    },

    fetchContent: async (id) => {
        set({ isLoading: true, error: null, currentContent: null });
        try {
            const currentContent = await contentService.getById(id);
            set({ currentContent, isLoading: false, error: null });
        } catch (error) {
            set({ currentContent: null, isLoading: false, error: messageOf(error, 'Impossible de charger ce contenu.') });
        }
    },

    fetchCategories: async () => {
        try {
            const categories = await contentService.getCategories();
            set({ categories });
        } catch (error) {
            set({ error: messageOf(error, 'Erreur lors du chargement des catégories.') });
        }
    },

    createContent: async (input, file, cover) => {
        set({ isSaving: true, error: null });
        try {
            const content = await contentService.create(input, file, cover);
            set((state) => ({
                contents: [content, ...state.contents.filter((item) => item.id !== content.id)],
                currentContent: content,
                isSaving: false,
                error: null,
            }));
            return content;
        } catch (error) {
            set({ isSaving: false, error: messageOf(error, 'Erreur lors de la création du contenu.') });
            throw error;
        }
    },

    updateContent: async (id, input, file, cover) => {
        set({ isSaving: true, error: null });
        try {
            const content = await contentService.update(id, input, file, cover);
            set((state) => ({
                contents: state.contents.map((item) => item.id === id ? content : item),
                currentContent: content,
                isSaving: false,
                error: null,
            }));
            return content;
        } catch (error) {
            set({ isSaving: false, error: messageOf(error, 'Erreur lors de la mise à jour du contenu.') });
            throw error;
        }
    },

    deleteContent: async (id) => {
        set({ isSaving: true, error: null });
        try {
            await contentService.delete(id);
            set((state) => ({
                contents: state.contents.filter((item) => item.id !== id),
                currentContent: state.currentContent?.id === id ? null : state.currentContent,
                isSaving: false,
                error: null,
            }));
        } catch (error) {
            set({ isSaving: false, error: messageOf(error, 'Erreur lors de la suppression du contenu.') });
            throw error;
        }
    },

    clearError: () => set({ error: null }),
}));
