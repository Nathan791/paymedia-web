import * as contentRepository from '../repositories/content.repository'
import type { ContentCreate, ContentUpdate, ContentFilter } from '@paymedia/schemas'

export async function listContents(filters: ContentFilter) {
    return contentRepository.findAll(filters)
}

export async function listMyContents(userId: number, filters: ContentFilter) {
    return contentRepository.findMine(userId, filters)
}

export async function getContent(ulid: string) {
    const content = await contentRepository.findByUlid(ulid)
    if (!content) throw new Error('NOT_FOUND')
    return content
}

export async function createContent(userId: number, data: ContentCreate, fileUrl: string, coverUrl?: string) {
    return contentRepository.create(userId, data, fileUrl, coverUrl)
}

export async function updateContent(ulid: string, userId: number, data: ContentUpdate) {
    const content = await contentRepository.findByUlid(ulid)
    if (!content) throw new Error('NOT_FOUND')
    if (content.userId !== userId) throw new Error('FORBIDDEN')
    return contentRepository.update(ulid, data)
}

export async function deleteContent(ulid: string, userId: number) {
    const content = await contentRepository.findByUlid(ulid)
    if (!content) throw new Error('NOT_FOUND')
    if (content.userId !== userId) throw new Error('FORBIDDEN')
    return contentRepository.softDelete(ulid)
}
