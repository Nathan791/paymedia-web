import { prisma, Prisma } from '@paymedia/database'
import { generateId, generateSlug } from '@paymedia/utils'

export interface ContentFilters {
    page: number
    limit: number
    category_id?: number
    media_type?: 'epub' | 'audio' | 'video'
}

export interface ContentCreate {
    category_id: number
    title: string
    description: string
    media_type: 'epub' | 'audio' | 'video'
    price?: number
    is_premium?: boolean
}

export interface ContentUpdate {
    category_id?: number
    title?: string
    description?: string
    media_type?: 'epub' | 'audio' | 'video'
    price?: number
    is_premium?: boolean
}

const PUBLISHED_STATUS = 'published' as const

/**
 * Liste les contenus publiés et non supprimés.
 */
export async function findAll(filters: ContentFilters) {
    const page = Math.max(1, filters.page || 1)
    const limit = Math.min(100, Math.max(1, filters.limit || 20))

    const where = {
        deletedAt: null,
        status: PUBLISHED_STATUS,
        ...(filters.category_id !== undefined && {
            categoryId: filters.category_id,
        }),
        ...(filters.media_type !== undefined && {
            mediaType: filters.media_type,
        }),
    }

    const [items, total] = await Promise.all([
        prisma.pm_content.findMany({
            where,
            orderBy: {
                createdAt: 'desc',
            },
            skip: (page - 1) * limit,
            take: limit,
        }),

        prisma.pm_content.count({ where }),
    ])

    return {
        items,
        total,
        page,
        limit,
    }
}

/**
 * Recherche un contenu par ULID sans inclure les contenus supprimés.
 */
export async function findByUlid(ulid: string) {
    return prisma.pm_content.findFirst({
        where: {
            ulid,
            deletedAt: null,
        },
    })
}

/**
 * Alias conservé pour les appels existants du service.
 */
export async function findByUlidWithAuthor(ulid: string) {
    // Le schéma Prisma actuel ne déclare pas de relation author.
    return findByUlid(ulid)
}

/**
 * Crée un contenu et enregistre son fichier principal.
 */
export async function create(
    userId: number,
    data: ContentCreate,
    fileUrl: string,
) {
    const slug = generateSlug(data.title)

    return prisma.$transaction(async (tx: Prisma.TransactionClient) => {
        const content = await tx.pm_content.create({
            data: {
                ulid: generateId(),
                userId,
                categoryId: data.category_id,
                title: data.title,
                slug,
                description: data.description,
                mediaType: data.media_type,
                isPremium: data.is_premium ?? true,
                price: data.price ?? 0,
                status: 'draft',
            },
        })

        await tx.pm_content_file.create({
            data: {
                ulid: generateId(),
                content_id: content.id,
                file_type: 'main',
                file_url: fileUrl,
            },
        })

        return content
    })
}

/**
 * Met à jour les champs fournis.
 */
export async function update(
    ulid: string,
    data: ContentUpdate,
) {
    const current = await findByUlid(ulid)

    if (!current) {
        throw new Error('NOT_FOUND')
    }

    return prisma.pm_content.update({
        where: {
            ulid,
        },
        data: {
            ...(data.category_id !== undefined && {
                categoryId: data.category_id,
            }),

            ...(data.title !== undefined && {
                title: data.title,
                slug: generateSlug(data.title),
            }),

            ...(data.description !== undefined && {
                description: data.description,
            }),

            ...(data.media_type !== undefined && {
                mediaType: data.media_type,
            }),

            ...(data.price !== undefined && {
                price: data.price,
            }),

            ...(data.is_premium !== undefined && {
                isPremium: data.is_premium,
            }),
        },
    })
}

/**
 * Suppression logique : le contenu reste en base de données.
 */
export async function softDelete(ulid: string) {
    const content = await findByUlid(ulid)

    if (!content) {
        throw new Error('NOT_FOUND')
    }

    return prisma.pm_content.update({
        where: {
            ulid,
        },
        data: {
            deletedAt: new Date(),
        },
    })
}