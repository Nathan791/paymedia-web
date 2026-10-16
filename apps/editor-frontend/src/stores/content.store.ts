import { create } from 'zustand';
import { contentApi } from '@/api/content.api';
import { Content, Category } from '@/models';

interface ContentState {
    contents: Content[];
    categories: Category[];
    currentContent: Content | null;

    isLoading: boolean;
    error: string | null;
    totalCount: number;

    fetchContents: () => Promise<void>;
    fetchCategories: () => Promise<void>;
    fetchContent: (ulid: string) => Promise<void>;

    createContent: (data: FormData) => Promise<Content>;
    updateContent: (
        ulid: string,
        data: FormData
    ) => Promise<Content>;

    deleteContent: (ulid: string) => Promise<void>;

    changeStatus: (
        ulid: string,
        status: string
    ) => Promise<Content>;

    addCover: (
        ulid: string,
        file: File
    ) => Promise<Content>;

    clearError: () => void;
    reset: () => void;
}

const initialState = {
    contents: [] as Content[],
    categories: [] as Category[],
    currentContent: null as Content | null,

    isLoading: false,
    error: null as string | null,
    totalCount: 0,
};

export const useContentStore = create<ContentState>((set) => ({
    ...initialState,

    fetchContents: async () => {
        set({
            isLoading: true,
            error: null,
        });

        try {
            const contents = await contentApi.getAll();

            set({
                contents,
                totalCount: contents.length,
                isLoading: false,
            });
        } catch (error: any) {
            set({
                contents: [],
                totalCount: 0,
                isLoading: false,
                error:
                    error.response?.data?.message ??
                    'Erreur de chargement des contenus',
            });
        }
    },

    fetchCategories: async () => {
        set({
            isLoading: true,
            error: null,
        });

        try {
            const categories =
                await contentApi.getCategories();

            set({
                categories,
                isLoading: false,
            });
        } catch (error: any) {
            set({
                categories: [],
                isLoading: false,
                error:
                    error.response?.data?.message ??
                    'Erreur de chargement des catégories',
            });
        }
    },

    fetchContent: async (ulid: string) => {
        set({
            isLoading: true,
            error: null,
        });

        try {
            const content =
                await contentApi.getOne(ulid);

            set({
                currentContent: content,
                isLoading: false,
            });
        } catch (error: any) {
            set({
                isLoading: false,
                error:
                    error.response?.data?.message ??
                    'Erreur de chargement du contenu',
            });

            throw error;
        }
    },

    createContent: async (data: FormData) => {
        set({
            isLoading: true,
            error: null,
        });

        try {
            const content =
                await contentApi.create(data);

            set((state) => ({
                contents: [
                    content,
                    ...state.contents,
                ],
                totalCount:
                    state.totalCount + 1,
                currentContent: content,
                isLoading: false,
            }));

            return content;
        } catch (error: any) {
            set({
                isLoading: false,
                error:
                    error.response?.data?.message ??
                    'Erreur de création du contenu',
            });

            throw error;
        }
    },

    updateContent: async (
        ulid: string,
        data: FormData
    ) => {
        set({
            isLoading: true,
            error: null,
        });

        try {
            const content =
                await contentApi.update(
                    ulid,
                    data
                );

            set((state) => ({
                contents: state.contents.map(
                    (item) =>
                        item.ulid === ulid
                            ? content
                            : item
                ),
                currentContent: content,
                isLoading: false,
            }));

            return content;
        } catch (error: any) {
            set({
                isLoading: false,
                error:
                    error.response?.data?.message ??
                    'Erreur de mise à jour du contenu',
            });

            throw error;
        }
    },

    deleteContent: async (ulid: string) => {
        set({
            isLoading: true,
            error: null,
        });

        try {
            await contentApi.delete(ulid);

            set((state) => ({
                contents:
                    state.contents.filter(
                        (item) =>
                            item.ulid !== ulid
                    ),
                totalCount:
                    Math.max(
                        0,
                        state.totalCount - 1
                    ),
                currentContent:
                    state.currentContent?.ulid ===
                    ulid
                        ? null
                        : state.currentContent,
                isLoading: false,
            }));
        } catch (error: any) {
            set({
                isLoading: false,
                error:
                    error.response?.data?.message ??
                    'Erreur de suppression du contenu',
            });

            throw error;
        }
    },

    changeStatus: async (
        ulid: string,
        status: string
    ) => {
        set({
            isLoading: true,
            error: null,
        });

        try {
            const content =
                await contentApi.changeStatus(
                    ulid,
                    status
                );

            set((state) => ({
                contents: state.contents.map(
                    (item) =>
                        item.ulid === ulid
                            ? content
                            : item
                ),
                currentContent: content,
                isLoading: false,
            }));

            return content;
        } catch (error: any) {
            set({
                isLoading: false,
                error:
                    error.response?.data?.message ??
                    'Erreur de changement de statut',
            });

            throw error;
        }
    },

    addCover: async (
        ulid: string,
        file: File
    ) => {
        set({
            isLoading: true,
            error: null,
        });

        try {
            const content =
                await contentApi.addCover(
                    ulid,
                    file
                );

            set((state) => ({
                contents: state.contents.map(
                    (item) =>
                        item.ulid === ulid
                            ? content
                            : item
                ),
                currentContent: content,
                isLoading: false,
            }));

            return content;
        } catch (error: any) {
            set({
                isLoading: false,
                error:
                    error.response?.data?.message ??
                    "Erreur d'ajout de la couverture",
            });

            throw error;
        }
    },

    clearError: () => {
        set({
            error: null,
        });
    },

    reset: () => {
        set(initialState);
    },
}));