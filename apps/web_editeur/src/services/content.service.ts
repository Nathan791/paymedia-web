// src/services/content.service.ts
//
// ============================================================================
// SERVICE MÉTIER CONTENU
// ============================================================================
//
// Le service contient les règles métier du Web Éditeur.
//
// Le repository s'occupe de communiquer avec l'API.
//
// Le service s'occupe de décider si une opération est acceptable.
//
// Exemple :
//
// - le titre est obligatoire
// - la description est obligatoire
// - un fichier est obligatoire
// - un contenu premium doit avoir un prix
//
// ============================================================================

import {
    contentRepository,
} from '@/repositories/content.repository';

import {
    Content,
    ContentCategory,
    ContentDraftInput,
} from '@/models';


// ============================================================================
// VALIDATION D'UN CONTENU
// ============================================================================

function validateContentInput(
    input: ContentDraftInput
): void {

    if (!input.title.trim()) {

        throw new Error(
            'Le titre est obligatoire.'
        );
    }


    if (!input.description.trim()) {

        throw new Error(
            'La description est obligatoire.'
        );
    }


    if (input.isPremium && input.price <= 0) {

        throw new Error(
            'Un contenu premium doit avoir un prix supérieur à 0.'
        );
    }


    if (
        ![
            'epub',
            'audio',
            'video',
        ].includes(input.mediaType)
    ) {

        throw new Error(
            'Le type de média sélectionné est invalide.'
        );
    }
}


// ============================================================================
// SERVICE PUBLIC
// ============================================================================

export const contentService = {


    // =========================================================================
    // RÉCUPÉRER MES CONTENUS
    // =========================================================================

    listMyContents():
        Promise<Content[]> {

        return contentRepository
            .listMyContents();
    },


    // =========================================================================
    // RÉCUPÉRER LES CATÉGORIES
    // =========================================================================
    //
    // Pour l'instant aucun endpoint réel n'a été fourni.
    //

    getCategories():
        Promise<ContentCategory[]> {

        return contentRepository
            .getCategories();
    },


    // =========================================================================
    // CRÉER UN CONTENU
    // =========================================================================

    async create(
        input: ContentDraftInput,
        file: File | null,
        coverFile: File | null
    ): Promise<Content> {

        // ---------------------------------------------------------------------
        // VALIDATION DES INFORMATIONS
        // ---------------------------------------------------------------------

        validateContentInput(
            input
        );


        // ---------------------------------------------------------------------
        // VALIDATION DU FICHIER
        // ---------------------------------------------------------------------

        if (!file) {

            throw new Error(
                'Le fichier du contenu est obligatoire.'
            );
        }


        // ---------------------------------------------------------------------
        // ENVOI AU REPOSITORY
        // ---------------------------------------------------------------------

        return contentRepository.create(
            input,
            file,
            coverFile
        );
    },
};