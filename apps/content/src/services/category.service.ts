import * as categoryRepository from '../repositories/category.repository'
import { generateSlug } from '@paymedia/utils'
import type { CategoryCreate } from '@paymedia/schemas'

export async function listCategories() {
    return categoryRepository.findAll()
}

export async function getCategory(ulid: string) {
    const cat = await categoryRepository.findByUlid(ulid)
    if (!cat) throw new Error('NOT_FOUND')
    return cat
}

export async function createCategory(data: CategoryCreate) {
    const slug = data.slug ?? generateSlug(data.name)
    const existing = await categoryRepository.findBySlug(slug)
    if (existing) throw new Error('SLUG_TAKEN')
    return categoryRepository.create({ name: data.name, slug })
}
