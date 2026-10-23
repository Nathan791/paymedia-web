// src/services/catalog.service.ts
import { prisma, MediaType, PubStatus } from '@paymedia/database';
import { PublicationSchema } from '@paymedia/schemas';
import { ulid } from 'ulid';
import type { z } from 'zod';

type PublicationInput = z.infer<typeof PublicationSchema>;

export class CatalogService {
    /**
     * Création d'une nouvelle œuvre.
     * Mappe les champs du DTO (Zod) vers le modèle Prisma.
     */
    async createPublication(data: PublicationInput, authorId: number | string) {
        // userId est un Int en base : conversion et validation
        const userId = Number(authorId);
        if (!Number.isInteger(userId) || userId <= 0) {
            throw new Error('Identifiant auteur invalide');
        }

        // L'enum MediaType ne contient que epub, audio et video
        const mediaType = data.contentType as MediaType;

        return prisma.contenu.create({
            data: {
                ulid: ulid(),
                title: data.title,
                description: data.description ?? null,
                mediaType,
                fileUrl: data.mediaUrl,
                thumbnailUrl: data.thumbnailUrl ?? null,
                isPremium: data.isPremium ?? false,
                price: data.price,
                status: PubStatus.pending_review,
                userId,
            },
        });
    }

    /**
     * Catalogue public paginé (contenus publiés uniquement).
     */
    async getPublicCatalog(page = 1, limit = 20) {
        const safePage = Math.max(1, page);
        const safeLimit = Math.min(Math.max(1, limit), 100);
        const skip = (safePage - 1) * safeLimit;

        const where = { status: PubStatus.published, deletedAt: null };

        const [items, total] = await prisma.$transaction([
            prisma.contenu.findMany({
                where,
                skip,
                take: safeLimit,
                orderBy: { createdAt: 'desc' },
                select: {
                    ulid: true,
                    title: true,
                    description: true,
                    mediaType: true,
                    thumbnailUrl: true,
                    isPremium: true,
                    price: true,
                    createdAt: true,
                },
            }),
            prisma.contenu.count({ where }),
        ]);

        return { items, total, page: safePage, limit: safeLimit };
    }
}