// src/api/client.ts
//
// ============================================================================
// CLIENT HTTP CENTRAL DE L'APPLICATION
// ============================================================================
//
// Ce fichier est le point d'entrée unique pour communiquer avec l'API.
//
// Architecture :
//
//   Page
//     ↓
//   Store Zustand
//     ↓
//   Service métier
//     ↓
//   Repository
//     ↓
//   apiClient
//     ↓
//   API PayMedia
//
// Le client s'occupe notamment de :
//
// - construire l'URL finale de l'API
// - ajouter automatiquement le token Authorization
// - envoyer du JSON lorsque nécessaire
// - envoyer du FormData pour les uploads
// - analyser les réponses JSON
// - transformer les erreurs HTTP en Error JavaScript
//
// IMPORTANT :
// Pour un FormData, nous NE définissons PAS manuellement
// "Content-Type: multipart/form-data".
// Le navigateur doit lui-même ajouter le boundary nécessaire.
//
// ============================================================================

// VITE_API_URL doit désigner la racine versionnée de l'API, par ex. /api/v1.
const API_BASE_URL = (
    import.meta.env.VITE_API_URL ||
    '/api'
).replace(/\/+$/, '');


// ============================================================================
// OPTIONS COMMUNES
// ============================================================================

interface RequestOptions extends RequestInit {

    // Lorsque auth = true, le client ajoute automatiquement :
    //
    // Authorization: Bearer <accessToken>
    //
    auth?: boolean;
}


// ============================================================================
// CLÉS DE STOCKAGE
// ============================================================================

const ACCESS_TOKEN_KEY =
    'paymedia.access_token';


// ============================================================================
// RÉCUPÉRATION DU TOKEN
// ============================================================================

function getAccessToken(): string | null {

    return localStorage.getItem(
        ACCESS_TOKEN_KEY
    );
}


// ============================================================================
// SAUVEGARDE DU TOKEN
// ============================================================================

export function setAccessToken(
    token: string
): void {

    localStorage.setItem(
        ACCESS_TOKEN_KEY,
        token
    );
}


// ============================================================================
// SUPPRESSION DU TOKEN
// ============================================================================

export function clearAccessToken(): void {

    localStorage.removeItem(
        ACCESS_TOKEN_KEY
    );
}


// ============================================================================
// FONCTION HTTP INTERNE
// ============================================================================

async function request<T>(
    path: string,
    options: RequestOptions = {}
): Promise<T> {

    const {
        auth = false,
        headers,
        body,
        ...fetchOptions
    } = options;


    // ------------------------------------------------------------------------
    // CONSTRUCTION DES HEADERS
    // ------------------------------------------------------------------------

    const requestHeaders =
        new Headers(headers);


    // ------------------------------------------------------------------------
    // AUTHENTIFICATION
    // ------------------------------------------------------------------------
    //
    // Le token n'est pas envoyé manuellement depuis chaque page.
    //
    // Le repository demande simplement :
    //
    //     auth: true
    //
    // et ce client ajoute automatiquement :
    //
    //     Authorization: Bearer <token>
    //

    if (auth) {

        const token =
            getAccessToken();

        if (token) {

            requestHeaders.set(
                'Authorization',
                `Bearer ${token}`
            );
        }
    }


    // ------------------------------------------------------------------------
    // CONTENT-TYPE
    // ------------------------------------------------------------------------
    //
    // Si le body est un FormData, surtout NE PAS définir Content-Type.
    //
    // Le navigateur produira automatiquement quelque chose comme :
    //
    // multipart/form-data; boundary=----WebKitFormBoundary...
    //
    // Pour tout autre body JSON, nous utilisons application/json.
    //

    if (
        body !== undefined &&
        !(body instanceof FormData)
    ) {

        requestHeaders.set(
            'Content-Type',
            'application/json'
        );
    }


    // ------------------------------------------------------------------------
    // APPEL FETCH
    // ------------------------------------------------------------------------

    const response =
        await fetch(
            `${API_BASE_URL}/${path.replace(/^\/+/, '')}`,
            {
                ...fetchOptions,
                body,
                headers: requestHeaders,
            }
        );


    // ------------------------------------------------------------------------
    // LECTURE DE LA RÉPONSE
    // ------------------------------------------------------------------------

    const contentType =
        response.headers.get(
            'content-type'
        ) || '';


    const responseBody =
        contentType.includes(
            'application/json'
        )
            ? await response.json()
            : await response.text();


    // ------------------------------------------------------------------------
    // GESTION DES ERREURS HTTP
    // ------------------------------------------------------------------------

    if (!response.ok) {

        let message =
            'Une erreur est survenue.';


        if (
            typeof responseBody === 'object' &&
            responseBody !== null
        ) {

            if (
                'message' in responseBody &&
                typeof responseBody.message === 'string'
            ) {

                message =
                    responseBody.message;
            }

                // Certaines API peuvent retourner
                // une erreur sous la forme :
                //
                // {
                //     success: false,
                //     error: "...",
                //     message: "..."
                // }
                //
            // On essaie donc aussi error.

            else if (
                'error' in responseBody &&
                typeof responseBody.error === 'string'
            ) {

                message =
                    responseBody.error;
            }
        }


        throw new Error(message);
    }


    // ------------------------------------------------------------------------
    // RETOUR DE LA RÉPONSE
    // ------------------------------------------------------------------------

    return responseBody as T;
}


// ============================================================================
// CLIENT PUBLIC
// ============================================================================

export const apiClient = {


    // =========================================================================
    // GET
    // =========================================================================

    get<T>(
        path: string,
        options?: RequestOptions
    ): Promise<T> {

        return request<T>(
            path,
            {
                ...options,
                method: 'GET',
            }
        );
    },


    // =========================================================================
    // POST JSON
    // =========================================================================

    post<T>(
        path: string,
        body?: unknown,
        options?: RequestOptions
    ): Promise<T> {

        return request<T>(
            path,
            {
                ...options,
                method: 'POST',

                body:
                    body !== undefined
                        ? JSON.stringify(body)
                        : undefined,
            }
        );
    },


    // =========================================================================
    // POST MULTIPART / FORMDATA
    // =========================================================================
    //
    // Cette méthode est utilisée pour les contenus.
    //
    // Exemple :
    //
    // const formData = new FormData();
    //
    // formData.append('title', 'Mon article');
    // formData.append('files', file);
    // formData.append('cover_image', cover);
    //
    // apiClient.postForm('/content', formData, {
    //     auth: true,
    // });
    //
    // ========================================================================

    postForm<T>(
        path: string,
        formData: FormData,
        options?: Omit<RequestOptions, 'body'>
    ): Promise<T> {

        return request<T>(
            path,
            {
                ...options,
                method: 'POST',
                body: formData,
            }
        );
    },


    // =========================================================================
    // PUT JSON
    // =========================================================================

    put<T>(
        path: string,
        body?: unknown,
        options?: RequestOptions
    ): Promise<T> {

        return request<T>(
            path,
            {
                ...options,
                method: 'PUT',

                body:
                    body !== undefined
                        ? JSON.stringify(body)
                        : undefined,
            }
        );
    },


    // =========================================================================
    // PATCH JSON
    // =========================================================================

    patch<T>(
        path: string,
        body?: unknown,
        options?: RequestOptions
    ): Promise<T> {
        return request<T>(
            path,
            {
                ...options,
                method: 'PATCH',
                body: body !== undefined ? JSON.stringify(body) : undefined,
            }
        );
    },


    // =========================================================================
    // DELETE
    // =========================================================================

    delete<T>(
        path: string,
        options?: RequestOptions
    ): Promise<T> {

        return request<T>(
            path,
            {
                ...options,
                method: 'DELETE',
            }
        );
    },
};