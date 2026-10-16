// src/repositories/content.repository.ts
//
// ============================================================================
// REPOSITORY CONTENU
// ============================================================================
//
// Cette couche est responsable de communiquer avec l'API.
//
// Le frontend ne connaît pas directement les URLs API.
//
// Exemple :
//
// Page
//   ↓
// Store
//   ↓
// Service
//   ↓
// Repository
//   ↓
// apiClient
//   ↓
// API
//
// Aujourd'hui, nous avons deux endpoints réels confirmés :
//
// GET
// /api/v1/catalog/content/my-contents
//
// POST
// /api/v1/catalog/content
//
// IMPORTANT :
// L'API utilise le token Authorization pour identifier l'auteur.
// Nous n'envoyons donc PAS de authorId/userId dans les requêtes.
//
// ============================================================================

import {
    ApiContent,
    Content,
    ContentCategory,
    ContentDraftInput,
    CreateContentResponse,
    MyContentsResponse,
} from '@/models';

import { apiClient } from '@/api/client';


// ============================================================================
// ENDPOINTS
// ============================================================================

const CONTENT_API_BASE =
    '/api/v1/catalog/content';


// ============================================================================
// CONVERSION DU STATUT API
// ============================================================================
//
// Le backend peut éventuellement ajouter de nouveaux statuts.
//
// Nous protégeons le frontend en retombant sur "draft" lorsqu'un statut
// inconnu arrive.
//
// ============================================================================

function normalizeStatus(
    status: string
): Content['status'] {

    const validStatuses: Content['status'][] = [

        'draft',

        'pending_review',

        'correction_requested',

        'approved',

        'scheduled',

        'published',

        'archived',
    ];

    return validStatuses.includes(
        status as Content['status']
    )
        ? status as Content['status']
        : 'draft';
}


// ============================================================================
// CONVERSION DU PRIX
// ============================================================================
//
// L'API retourne actuellement :
//
//     "price": "1500"
//
// tandis que le frontend travaille avec un number.
//
// ============================================================================

function normalizePrice(
    price: string | number
): number {

    const parsed =
        Number(price);

    return Number.isFinite(parsed)
        ? parsed
        : 0;
}


// ============================================================================
// MAPPING API → FRONTEND
// ============================================================================
//
// L'API ne retourne pas encore toutes les propriétés de notre modèle Content.
//
// Nous remplissons donc uniquement les informations connues.
//
// Les autres propriétés reçoivent des valeurs neutres afin de conserver
// la compatibilité avec les composants frontend existants.
//
// ============================================================================

function mapApiContent(
    apiContent: ApiContent
): Content {

    return {

        // L'API ne fournit actuellement qu'un ULID.
        // On utilise donc l'ULID comme identifiant frontend.

        id:
        apiContent.ulid,

        ulid:
        apiContent.ulid,

        title:
        apiContent.title,

        // Le backend ne fournit pas encore de slug.
        // Le titre constitue donc une valeur temporaire.

        slug:
            apiContent.title
                .toLowerCase()
                .trim()
                .replace(/\s+/g, '-'),

        // L'API actuelle n'a pas de champ summary séparé.

        summary:
        apiContent.description,

        description:
        apiContent.description,

        mediaType:
        apiContent.mediaType,

        // Le fichier réel n'est pas retourné dans my-contents.

        asset:
            null,

        coverUrl:
        apiContent.thumbnailUrl,

        category:
            apiContent.category
                ? {
                    name:
                    apiContent.category.name,

                    slug:
                    apiContent.category.slug,
                }
                : null,

        tags:
            [],

        isPremium:
        apiContent.isPremium,

        price:
            normalizePrice(
                apiContent.price
            ),

        currency:
            'XAF',

        freePreviewUnits:
            apiContent.freeEndPage ??
            apiContent.freePreviewDuration ??
            0,

        status:
            normalizeStatus(
                apiContent.status
            ),

        version:
            1,

        correctionComment:
            null,

        reviewerId:
            null,

        reviewerName:
            null,

        history:
            [],

        createdAt:
        apiContent.createdAt,

        updatedAt:
        apiContent.createdAt,

        scheduledAt:
            null,

        publishedAt:
            null,

        archivedAt:
            null,

        authorId:
            '',

        authorName:
            '',

        stats: {

            views:
                0,

            purchases:
                0,

            conversionRate:
                0,

            revenue:
                0,
        },
    };
}


// ============================================================================
// REPOSITORY PUBLIC
// ============================================================================

export const contentRepository = {


    // =========================================================================
    // MES CONTENUS
    // =========================================================================
    //
    // GET /catalog/content/my-contents
    //
    // Aucun body.
    //
    // Le backend identifie automatiquement l'utilisateur grâce au token :
    //
    // Authorization: Bearer <accessToken>
    //
    // =========================================================================

    async listMyContents(): Promise<Content[]> {

        const response =
            await apiClient.get<MyContentsResponse>(
                `${CONTENT_API_BASE}/my-contents`,
                {
                    auth: true,
                }
            );


        if (!response.success) {

            throw new Error(
                response.message ||
                'Impossible de récupérer vos contenus.'
            );
        }


        return response.data.items.map(
            mapApiContent
        );
    },


    // =========================================================================
    // CRÉATION D'UN CONTENU
    // =========================================================================
    //
    // POST /catalog/content
    //
    // Le backend attend du multipart/form-data.
    //
    // Champs confirmés :
    //
    // title
    // description
    // mediaType
    // price
    // categoryId
    // files
    // isPremium
    // cover_image
    //
    // =========================================================================

    async create(
        input: ContentDraftInput,
        file: File,
        coverFile: File | null
    ): Promise<Content> {

        const formData =
            new FormData();


        // ---------------------------------------------------------------------
        // INFORMATIONS DU CONTENU
        // ---------------------------------------------------------------------

        formData.append(
            'title',
            input.title.trim()
        );


        formData.append(
            'description',
            input.description.trim()
        );


        formData.append(
            'mediaType',
            input.mediaType
        );


        // ---------------------------------------------------------------------
        // PRIX
        // ---------------------------------------------------------------------
        //
        // Même si le backend accepte actuellement une chaîne ou un nombre,
        // FormData transmet les valeurs textuelles.
        //

        formData.append(
            'price',
            String(
                input.isPremium
                    ? input.price
                    : 0
            )
        );


        // ---------------------------------------------------------------------
        // CATÉGORIE
        // ---------------------------------------------------------------------

        if (input.categoryId) {

            formData.append(
                'categoryId',
                input.categoryId
            );
        }


        // ---------------------------------------------------------------------
        // PREMIUM
        // ---------------------------------------------------------------------

        formData.append(
            'isPremium',
            String(
                input.isPremium
            )
        );


        // ---------------------------------------------------------------------
        // FICHIER PRINCIPAL
        // ---------------------------------------------------------------------
        //
        // IMPORTANT :
        // Le nom "files" est imposé par le contrat API fourni.
        //

        formData.append(
            'files',
            file
        );


        // ---------------------------------------------------------------------
        // COUVERTURE
        // ---------------------------------------------------------------------
        //
        // La couverture est optionnelle.
        //

        if (coverFile) {

            formData.append(
                'cover_image',
                coverFile
            );
        }


        // ---------------------------------------------------------------------
        // APPEL API
        // ---------------------------------------------------------------------

        const response =
            await apiClient.postForm<CreateContentResponse>(
                CONTENT_API_BASE,
                formData,
                {
                    auth: true,
                }
            );


        if (!response.success) {

            throw new Error(
                response.message ||
                'Impossible de créer le contenu.'
            );
        }


        return mapApiContent(
            response.data
        );
    },


    // =========================================================================
    // CATÉGORIES
    // =========================================================================
    //
    // Aucun endpoint réel de catégories ne nous a encore été fourni.
    //
    // Nous ne faisons donc PAS semblant de connaître son endpoint.
    //
    // Cette méthode pourra être branchée dès que tu me donnes le contrat réel.
    //
    // =========================================================================

    async getCategories(): Promise<ContentCategory[]> {

        return [];
    },
};