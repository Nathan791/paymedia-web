import { prisma } from '@paymedia/database'
import { generateId } from '@paymedia/utils'

export async function findAll() {
    return prisma.category.findMany({ orderBy: { name: 'asc' } })
}

export async function findByUlid(ulid: string) {
    return prisma.category.findUnique({ where: { ulid } })
}

export async function findBySlug(slug: string) {
    return prisma.category.findUnique({ where: { slug } })
}

export async function create(data: { name: string; slug: string }) {
    return prisma.category.create({ data: { ulid: generateId(), ...data } })
}
