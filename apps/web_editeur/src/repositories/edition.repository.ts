// src/repositories/edition.repository.ts
import { Edition, EditionDraftInput, EditionStatus, EditionWithContents } from '@/models';
import { MOCK_EDITIONS } from '@/data/mock';
import { contentRepository } from './content.repository';
import { delay, generateId, generateUlid } from './_utils';

let editionsDb: Edition[] = MOCK_EDITIONS.map((e) => ({ ...e }));

async function resolve(edition: Edition): Promise<EditionWithContents> {
    const allContents = await contentRepository.list();
    const contents = edition.contentIds
        .map((id) => allContents.find((c) => c.id === id))
        .filter((c): c is NonNullable<typeof c> => Boolean(c));
    return { ...edition, contents };
}

export const editionRepository = {
    async list(): Promise<EditionWithContents[]> {
        await delay(null);
        const sorted = [...editionsDb].sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime());
        return Promise.all(sorted.map(resolve));
    },

    async getById(id: string): Promise<EditionWithContents> {
        await delay(null);
        const found = editionsDb.find((e) => e.id === id || e.ulid === id);
        if (!found) throw new Error('Édition introuvable.');
        return resolve(found);
    },

    async create(input: EditionDraftInput, authorId: string, authorName: string): Promise<Edition> {
        await delay(null, 500);
        const now = new Date().toISOString();
        const edition: Edition = {
            id: generateId('ed'),
            ulid: generateUlid(),
            title: input.title,
            description: input.description,
            coverUrl: null,
            contentIds: [],
            status: 'draft',
            createdAt: now,
            updatedAt: now,
            publishedAt: null,
            authorId,
            authorName,
        };
        editionsDb = [edition, ...editionsDb];
        return { ...edition };
    },

    // Ajoute/retire un contenu — jamais toute la liste écrasée d'un coup,
    // pour éviter les pertes de données en cas d'ajouts concurrents (même
    // en mock, on garde la bonne discipline).
    async addContent(editionId: string, contentId: string): Promise<Edition> {
        await delay(null, 300);
        const index = editionsDb.findIndex((e) => e.id === editionId);
        if (index === -1) throw new Error('Édition introuvable.');
        const existing = editionsDb[index];
        if (existing.contentIds.includes(contentId)) return { ...existing };
        const updated = { ...existing, contentIds: [...existing.contentIds, contentId], updatedAt: new Date().toISOString() };
        editionsDb = [...editionsDb.slice(0, index), updated, ...editionsDb.slice(index + 1)];
        return { ...updated };
    },

    async removeContent(editionId: string, contentId: string): Promise<Edition> {
        await delay(null, 300);
        const index = editionsDb.findIndex((e) => e.id === editionId);
        if (index === -1) throw new Error('Édition introuvable.');
        const existing = editionsDb[index];
        const updated = { ...existing, contentIds: existing.contentIds.filter((id) => id !== contentId), updatedAt: new Date().toISOString() };
        editionsDb = [...editionsDb.slice(0, index), updated, ...editionsDb.slice(index + 1)];
        return { ...updated };
    },

    async changeStatus(id: string, status: EditionStatus): Promise<Edition> {
        await delay(null, 400);
        const index = editionsDb.findIndex((e) => e.id === id);
        if (index === -1) throw new Error('Édition introuvable.');
        const existing = editionsDb[index];
        if (status === 'published' && existing.contentIds.length === 0) {
            throw new Error('Une édition doit contenir au moins un contenu avant publication.');
        }
        const now = new Date().toISOString();
        const updated: Edition = {
            ...existing,
            status,
            updatedAt: now,
            publishedAt: status === 'published' ? now : existing.publishedAt,
        };
        editionsDb = [...editionsDb.slice(0, index), updated, ...editionsDb.slice(index + 1)];
        return { ...updated };
    },

    async remove(id: string): Promise<void> {
        await delay(null, 400);
        const target = editionsDb.find((e) => e.id === id);
        if (!target) throw new Error('Édition introuvable.');
        if (target.status === 'published') {
            throw new Error("Impossible de supprimer une édition publiée. Archivez-la d'abord.");
        }
        editionsDb = editionsDb.filter((e) => e.id !== id);
    },
};
