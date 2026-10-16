// src/stores/content.store.ts
//
// ============================================================================
// STORE ZUSTAND — CONTENUS
// ============================================================================
//
// Le store représente l'état du module Contenu dans l'interface.
//
// Il ne connaît pas les URLs API.
//
// Il ne connaît pas non plus le token.
//
// Tout cela est géré plus bas :
//
// Store
//   ↓
// Service
//   ↓
// Repository
//   ↓
// apiClient
//   ↓
// Authorization: Bearer <token>
//
// ============================================================================

import { create } from 'zustand';

import {
    contentService,
} from '@/services/content.service';

import {
    Content,
    ContentCategory,
    ContentDraftInput,
} from '@/models';


// ============================================================================
// ÉTAT DU STORE
// ============================================================================

interface ContentState {

    contents: Content[];

    categories: ContentCategory[];

    currentContent: Content | null;

    isLoading: boolean;

    isSaving: boolean;

    error: string | null;


    // ------------------------------------------------------------------------
    // ACTIONS
    // ------------------------------------------------------------------------

    fetchContents:
        () => Promise<void>;

    fetchCategories:
        () => Promise<void>;

    createContent:
        (
            input: ContentDraftInput,
            file: File,
            cover: File | null
        ) => Promise<Content>;

    clearError:
        () => void;
}


// ============================================================================
// UTILITAIRE D'ERREUR
// ============================================================================

function getErrorMessage(
    error: unknown,
    fallback: string
): string {

    if (
        error instanceof Error &&
        error.message
    ) {

        return error.message;
    }

    return fallback;
}


// ============================================================================
// STORE
// ============================================================================

export const useContentStore =
    create<ContentState>(
        (set) => ({

            // =================================================================
            // ÉTAT INITIAL
            // =================================================================

            contents: [],

            categories: [],

            currentContent: null,

            isLoading: false,

            isSaving: false,

            error: null,


            // =================================================================
            // RÉCUPÉRER MES CONTENUS
            // =================================================================
            //
            // L'API utilise automatiquement le token pour déterminer
            // l'utilisateur connecté.
            //
            // Aucun userId n'est envoyé.
            //

            fetchContents:
                async () => {

                    set({
                        isLoading: true,

                        error: null,
                    });


                    try {

                        const contents =
                            await contentService
                                .listMyContents();


                        set({

                            contents,

                            isLoading: false,

                            error: null,
                        });

                    } catch (error) {

                        set({

                            contents: [],

                            isLoading: false,

                            error:
                                getErrorMessage(
                                    error,
                                    'Erreur lors du chargement de vos contenus.'
                                ),
                        });
                    }
                },


            // =================================================================
            // CATÉGORIES
            // =================================================================

            fetchCategories:
                async () => {

                    try {

                        const categories =
                            await contentService
                                .getCategories();


                        set({
                            categories,
                        });

                    } catch (error) {

                        set({

                            error:
                                getErrorMessage(
                                    error,
                                    'Erreur lors du chargement des catégories.'
                                ),
                        });
                    }
                },


            // =================================================================
            // CRÉATION
            // =================================================================

            createContent:
                async (
                    input,
                    file,
                    cover
                ) => {

                    set({

                        isSaving: true,

                        error: null,
                    });


                    try {

                        // -----------------------------------------------------
                        // IMPORTANT
                        // -----------------------------------------------------
                        //
                        // Nous n'envoyons pas l'utilisateur courant ici.
                        //
                        // L'API récupère l'utilisateur depuis :
                        //
                        // Authorization: Bearer <accessToken>
                        //
                        // -----------------------------------------------------

                        const content =
                            await contentService.create(
                                input,
                                file,
                                cover
                            );


                        // -----------------------------------------------------
                        // AJOUT IMMÉDIAT DANS LE STORE
                        // -----------------------------------------------------

                        set((state) => ({

                            contents: [
                                content,
                                ...state.contents,
                            ],

                            currentContent:
                            content,

                            isSaving: false,

                            error: null,
                        }));


                        return content;

                    } catch (error) {

                        set({

                            isSaving: false,

                            error:
                                getErrorMessage(
                                    error,
                                    'Erreur lors de la création du contenu.'
                                ),
                        });


                        throw error;
                    }
                },


            // =================================================================
            // NETTOYER L'ERREUR
            // =================================================================

            clearError:
                () => {

                    set({
                        error: null,
                    });
                },
        })
    );