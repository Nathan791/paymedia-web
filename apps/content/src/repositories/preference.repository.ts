import { prisma } from '@paymedia/database'

export async function findByUserUlid(userUlid: string) {
    return prisma.userPreference.findMany({
        where:   { userUlid },
        include: { tag: true }, // Remplacé 'category' par 'tag' car la relation category n'existe pas dans le schéma[cite: 2, 4]
    })
}

export async function upsert(userUlid: string, tagId: number, categoryId: number) {
    return prisma.userPreference.upsert({
        where:  { userUlid_tagId: { userUlid, tagId } }, // Utilisation de la clé composite correcte[cite: 2, 4]
        create: { userUlid, tagId, categoryId },
        update: { categoryId },
    })
}

export async function remove(userUlid: string, tagId: number) {
    return prisma.userPreference.delete({
        where: { userUlid_tagId: { userUlid, tagId } }, // Utilisation de la clé composite correcte[cite: 2, 4]
    })
}