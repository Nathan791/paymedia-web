// apps/core/src/repositories/content.repository.ts
import { prisma, MediaType, PubStatus } from '@paymedia/database'
import { generateId } from '@paymedia/utils'

export interface ContentFilters {
    page: number
    limit: number
    categoryId?: number
    mediaType?: MediaType
}

export interface ContentCreate {
    categoryId?: number
    title: string
    description?: string
    mediaType: MediaType
    price?: number
    isPremium?: boolean
}

export interface ContentUpdate {
    categoryId?: number
    title?: string
    description?: string
    mediaType?: MediaType
    price?: number
    isPremium?: boolean
    status?: PubStatus
}

/**
 * Liste les contenus publiés et non supprimés.
 */
export async function findAll(filters: ContentFilters) {
    const page = Math.max(1, filters.page || 1)
    const limit = Math.min(100, Math.max(1, filters.limit || 20))

    const where = {
        deletedAt: null,
        status: PubStatus.published,
        ...(filters.categoryId !== undefined && {
            categoryId: filters.categoryId,
        }),
        ...(filters.mediaType !== undefined && {
            mediaType: filters.mediaType,
        }),
    }

    const [items, total] = await Promise.all([
        prisma.contenu.findMany({
            where,
            orderBy: {
                createdAt: 'desc',
            },
            skip: (page - 1) * limit,
            take: limit,
        }),

        prisma.contenu.count({ where }),
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
    return prisma.contenu.findFirst({
        where: {
            ulid,
            deletedAt: null,
        },
    })
}

/**
 * Crée un contenu.
 */
export async function create(
    userId: number,
    data: ContentCreate,
    fileUrl: string,
) {
    return prisma.contenu.create({
        data: {
            ulid: generateId(),
            userId,
            categoryId: data.categoryId,
            title: data.title,
            description: data.description,
            mediaType: data.mediaType,
            fileUrl,
            isPremium: data.isPremium ?? false,
            price: data.price ?? 0,
            status: PubStatus.draft,
        },
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

    return prisma.contenu.update({
        where: {
            ulid,
        },
        data: {
            ...(data.categoryId !== undefined && {
                categoryId: data.categoryId,
            }),

            ...(data.title !== undefined && {
                title: data.title,
            }),

            ...(data.description !== undefined && {
                description: data.description,
            }),

            ...(data.mediaType !== undefined && {
                mediaType: data.mediaType,
            }),

            ...(data.price !== undefined && {
                price: data.price,
            }),

            ...(data.isPremium !== undefined && {
                isPremium: data.isPremium,
            }),

            ...(data.status !== undefined && {
                status: data.status,
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

    return prisma.contenu.update({
        where: {
            ulid,
        },
        data: {
            deletedAt: new Date(),
        },
    })
}