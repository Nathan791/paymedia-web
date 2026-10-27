import { prisma, MediaType, PubStatus } from '@paymedia/database'
import { generateId } from '@paymedia/utils'
import type { ContentCreate, ContentUpdate, ContentFilter } from '@paymedia/schemas'

export async function findAll(filters: ContentFilter) {
    const page = Math.max(1, filters.page || 1)
    const limit = Math.min(100, Math.max(1, filters.limit || 20))
    const where = {
        deletedAt: null,
        status: PubStatus.published,
        ...(filters.categoryId !== undefined && { categoryId: filters.categoryId }),
        ...(filters.mediaType !== undefined && { mediaType: filters.mediaType }),
    }

    const [items, total] = await Promise.all([
        prisma.contenu.findMany({
            where,
            include: { category: true },
            orderBy: { createdAt: 'desc' },
            skip: (page - 1) * limit,
            take: limit,
        }),
        prisma.contenu.count({ where }),
    ])

    return { items, total, page, limit }
}

/** Liste les contenus du compte connecté, y compris ses brouillons. */
export async function findMine(userId: number, filters: ContentFilter) {
    const page = Math.max(1, filters.page || 1)
    const limit = Math.min(100, Math.max(1, filters.limit || 20))
    const where = {
        userId,
        deletedAt: null,
        ...(filters.categoryId !== undefined && { categoryId: filters.categoryId }),
        ...(filters.mediaType !== undefined && { mediaType: filters.mediaType }),
    }

    const [items, total] = await Promise.all([
        prisma.contenu.findMany({
            where,
            include: { category: true },
            orderBy: { createdAt: 'desc' },
            skip: (page - 1) * limit,
            take: limit,
        }),
        prisma.contenu.count({ where }),
    ])

    return { items, total, page, limit }
}

export async function findByUlid(ulid: string) {
    return prisma.contenu.findFirst({
        where: { ulid, deletedAt: null },
        include: { category: true },
    })
}

export async function create(userId: number, data: ContentCreate, fileUrl: string, coverUrl?: string) {
    return prisma.contenu.create({
        data: {
            ulid: generateId(),
            userId,
            categoryId: data.categoryId,
            title: data.title,
            description: data.description,
            mediaType: data.mediaType,
            fileUrl,
            ...(coverUrl ? { coverUrl, thumbnailUrl: coverUrl } : {}),
            isPremium: data.isPremium ?? false,
            price: data.price ?? 0,
            freeStartPage: data.freeStartPage,
            freeEndPage: data.freeEndPage,
            freePreviewDuration: data.freePreviewDuration,
            status: PubStatus.draft,
        },
        include: { category: true },
    })
}

export async function update(ulid: string, data: ContentUpdate) {
    const current = await findByUlid(ulid)
    if (!current) throw new Error('NOT_FOUND')

    return prisma.contenu.update({
        where: { ulid },
        data: {
            ...(data.categoryId !== undefined && { categoryId: data.categoryId }),
            ...(data.title !== undefined && { title: data.title }),
            ...(data.description !== undefined && { description: data.description }),
            ...(data.mediaType !== undefined && { mediaType: data.mediaType }),
            ...(data.price !== undefined && { price: data.price }),
            ...(data.isPremium !== undefined && { isPremium: data.isPremium }),
            ...(data.freeStartPage !== undefined && { freeStartPage: data.freeStartPage }),
            ...(data.freeEndPage !== undefined && { freeEndPage: data.freeEndPage }),
            ...(data.freePreviewDuration !== undefined && { freePreviewDuration: data.freePreviewDuration }),
        },
        include: { category: true },
    })
}

export async function softDelete(ulid: string) {
    const content = await findByUlid(ulid)
    if (!content) throw new Error('NOT_FOUND')

    return prisma.contenu.update({
        where: { ulid },
        data: { deletedAt: new Date() },
    })
}
