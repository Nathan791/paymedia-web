import * as preferenceRepository from '../repositories/preference.repository'
import * as categoryRepository   from '../repositories/category.repository'

export async function getPreferences(userId: number) {
    return preferenceRepository.findByUser(userId)
}

export async function addPreference(userId: number, categoryId: number) {
    const cat = await categoryRepository.findByUlid(String(categoryId))
    // On accepte aussi l'id numérique directement depuis la route
    return preferenceRepository.upsert(userId, categoryId)
}

export async function removePreference(userId: number, categoryId: number) {
    return preferenceRepository.remove(userId, categoryId)
}
