import { prisma } from '@paymedia/database'
import { generateId } from '@paymedia/utils'
import type { ContentCreate, ContentUpdate, ContentFilter } from '@paymedia/schemas'

const includeRelations = {
    author:   { select: { ulid: true, username: true } },
    category: true,
} as const

export async function findAll(filters: ContentFilter) {
    const where: any = { deletedAt: null, status: 'publie' }
    if (filters.category_id) where.categoryId = filters.category_id
    if (filters.media_type)  where.mediaType  = filters.media_type

    const [items, total] = await Promise.all([
        prisma.content.findMany({
            where,
            include: includeRelations,
            orderBy: { createdAt: 'desc' },
            skip:    (filters.page - 1) * filters.limit,
            take:    filters.limit,
        }),
        prisma.content.count({ where }),
    ])
    return { items, total, page: filters.page, limit: filters.limit }
}

export async function findByUlid(ulid: string) {
    return prisma.content.findFirst({ where: { ulid, deletedAt: null }, include: includeRelations })
}

export async function findByUlidWithAuthor(ulid: string) {
    return prisma.content.findFirst({ where: { ulid, deletedAt: null }, include: includeRelations })
}

export async function create(userId: number, data: ContentCreate, fileUrl: string) {
    return prisma.content.create({
        data: {
            ulid:        generateId(),
            userId,
            categoryId:  data.category_id,
            title:       data.title,
            description: data.description,
            mediaType:   data.media_type,
            fileUrl,
            coverImage:  data.cover_image,
            price:       data.price,
        },
        include: includeRelations,
    })
}

export async function update(ulid: string, data: ContentUpdate) {
    return prisma.content.update({
        where: { ulid },
        data:  {
            ...(data.category_id !== undefined && { categoryId: data.category_id }),
            ...(data.title       !== undefined && { title:      data.title }),
            ...(data.description !== undefined && { description: data.description }),
            ...(data.media_type  !== undefined && { mediaType:  data.media_type }),
            ...(data.price       !== undefined && { price:      data.price }),
            ...(data.cover_image !== undefined && { coverImage: data.cover_image }),
        },
        include: includeRelations,
    })
}

export async function softDelete(ulid: string) {
    return prisma.content.update({ where: { ulid }, data: { deletedAt: new Date() } })
}
