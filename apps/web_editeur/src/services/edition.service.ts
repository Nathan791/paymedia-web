// src/services/edition.service.ts
import { editionRepository } from '@/repositories/edition.repository';
import { EditionDraftInput } from '@/models';

export const editionService = {
    list: () => editionRepository.list(),
    getById: (id: string) => editionRepository.getById(id),

    create(input: EditionDraftInput, authorId: string, authorName: string) {
        if (!input.title.trim()) throw new Error("Le titre de l'édition est obligatoire.");
        return editionRepository.create(input, authorId, authorName);
    },

    addContent: (editionId: string, contentId: string) => editionRepository.addContent(editionId, contentId),
    removeContent: (editionId: string, contentId: string) => editionRepository.removeContent(editionId, contentId),

    publish: (id: string) => editionRepository.changeStatus(id, 'published'),
    archive: (id: string) => editionRepository.changeStatus(id, 'archived'),
    restore: (id: string) => editionRepository.changeStatus(id, 'draft'),

    remove: (id: string) => editionRepository.remove(id),
};
