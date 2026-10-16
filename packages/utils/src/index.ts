import { ulid } from 'ulid'

export { default as HttpStatus } from './http-status'

/**
 * Génère un ULID utilisé comme identifiant public.
 */
export function generateId(): string {
    return ulid()
}

export function isValidId(id: string): boolean {
    return /^[0-9A-HJKMNP-TV-Z]{26}$/.test(id)
}

/**
 * Génère un slug URL-friendly.
 * Ex: "L'Aventure au Cameroun" → "laventure-au-cameroun"
 */
export function generateSlug(text: string): string {
    return text
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .toLowerCase()
        .replace(/['']/g, '')
        .replace(/[^a-z0-9\s-]/g, '')
        .trim()
        .replace(/\s+/g, '-')
        .replace(/-+/g, '-')
}

/**
 * Retourne le timestamp ISO courant.
 */
export function ts(): string {
    return new Date().toISOString()
}

/**
 * Helper de pagination Prisma.
 */
export function paginate(page: number, limit: number) {
    return { skip: (page - 1) * limit, take: limit }
}
