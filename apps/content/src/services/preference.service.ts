import { prisma } from '@paymedia/database'
import * as preferenceRepository from '../repositories/preference.repository'
import * as categoryRepository from '../repositories/category.repository'

// Fonction utilitaire interne pour convertir l'ID numérique en ULID utilisateur
async function getUserUlid(userId: number): Promise<string> {
    const user = await prisma.user.findUnique({
        where: { id: userId },
        select: { ulid: true },
    })
    if (!user) {
        throw new Error('USER_NOT_FOUND')
    }
    return user.ulid
}

export async function getPreferences(userId: number) {
    const userUlid = await getUserUlid(userId)
    return preferenceRepository.findByUserUlid(userUlid)
}

export async function addPreference(userId: number, categoryId: number) {
    const userUlid = await getUserUlid(userId)

    // Utilisation de 'cat' pour s'assurer qu'elle est bien lue (résout TS6133)
    const cat = await categoryRepository.findByUlid(String(categoryId))
    const tagId = cat ? cat.id : categoryId

    // Appel avec les 3 arguments attendus par le repository (userUlid, tagId, categoryId)
    return preferenceRepository.upsert(userUlid, tagId, categoryId)
}

export async function removePreference(userId: number, categoryId: number) {
    const userUlid = await getUserUlid(userId)
    // categoryId fait office de tagId dans la clé composite du repository
    return preferenceRepository.remove(userUlid, categoryId)
}