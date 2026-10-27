import { contentRepository } from '@/repositories/content.repository';
import type { Content, ContentCategory, ContentDraftInput } from '@/models';

function validateContentInput(input: ContentDraftInput): void {
    if (!input.title.trim()) throw new Error('Le titre est obligatoire.');
    if (!input.description.trim()) throw new Error('La description est obligatoire.');
    if (!input.categoryId || !Number.isInteger(Number(input.categoryId)) || Number(input.categoryId) <= 0) {
        throw new Error('Sélectionnez une catégorie valide.');
    }
    if (input.isPremium && input.price <= 0) throw new Error('Un contenu premium doit avoir un prix supérieur à 0.');
    if (!['epub', 'audio', 'video'].includes(input.mediaType)) throw new Error('Le type de média sélectionné est invalide.');
}

export const contentService = {
    listMyContents(): Promise<Content[]> {
        return contentRepository.listMyContents();
    },

    getById(id: string): Promise<Content> {
        if (!id.trim()) throw new Error('Identifiant du contenu manquant.');
        return contentRepository.getById(id);
    },

    getCategories(): Promise<ContentCategory[]> {
        return contentRepository.getCategories();
    },

    async create(input: ContentDraftInput, file: File | null, coverFile: File | null): Promise<Content> {
        validateContentInput(input);
        if (!file) throw new Error('Le fichier du contenu est obligatoire.');
        return contentRepository.create(input, file, coverFile);
    },

    async update(id: string, input: ContentDraftInput, file?: File | null, coverFile?: File | null): Promise<Content> {
        validateContentInput(input);
        if (!id.trim()) throw new Error('Identifiant du contenu manquant.');
        return contentRepository.update(id, input, file, coverFile);
    },

    async delete(id: string): Promise<void> {
        if (!id.trim()) throw new Error('Identifiant du contenu manquant.');
        return contentRepository.delete(id);
    },
};
