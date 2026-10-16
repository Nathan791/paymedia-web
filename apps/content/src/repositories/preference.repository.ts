import { prisma } from '@paymedia/database'

export async function findByUser(userId: number) {
    return prisma.userPreference.findMany({
        where:   { userId },
        include: { category: true },
    })
}

export async function upsert(userId: number, categoryId: number) {
    return prisma.userPreference.upsert({
        where:  { userId_categoryId: { userId, categoryId } },
        create: { userId, categoryId },
        update: {},
    })
}

export async function remove(userId: number, categoryId: number) {
    return prisma.userPreference.delete({
        where: { userId_categoryId: { userId, categoryId } },
    })
}
