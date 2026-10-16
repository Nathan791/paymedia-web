// src/services/access.service.ts
import { accessRepository, CreateAccessPointInput } from '@/repositories/access.repository';

export const accessService = {
    list: (contentId?: string) => accessRepository.list(contentId),
    getById: (id: string) => accessRepository.getById(id),

    create(input: CreateAccessPointInput) {
        if (!input.label.trim()) throw new Error('Le nom du point d\'accès est obligatoire.');
        if (input.expiresAt && new Date(input.expiresAt).getTime() <= Date.now()) {
            throw new Error('La date d\'expiration doit être dans le futur.');
        }
        return accessRepository.create(input);
    },

    pause: (id: string) => accessRepository.setStatus(id, 'paused'),
    activate: (id: string) => accessRepository.setStatus(id, 'active'),
};
