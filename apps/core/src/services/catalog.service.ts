// src/services/catalog.service.ts
import { prisma, MediaType, PubStatus } from '@paymedia/database';
import { PublicationSchema } from '@paymedia/schemas';
import { ulid } from 'ulid';
import { z } from 'zod';

type PublicationInput = z.infer<typeof PublicationSchema>;

export class CatalogService {

    /**
     * 🚀 Création d'une nouvelle œuvre
     * Mappe les champs du DTO (Zod) vers le modèle de données (Prisma)
     */
    async createPublication(data: PublicationInput, authorId: string) {
        // Validation sécurisée du type de média pour correspondre à l'enum de la DB
        // Si le contentType est 'pdf', on le replie sur 'epub' ou on lève une erreur selon votre politique métier
        let dbMediaType: MediaType;

        if (data.contentType === 'pdf') {
            // Ajustement si votre schéma Prisma n'a pas encore migré pour le support PDF
            dbMediaType = MediaType.epub;
        } else {
            dbMediaType = data.contentType as MediaType;
        }

        return prisma.contenu.create({
            data: {
                ulid: ulid(),                          // ID public unique triable
                title: data.title,
                description: data.description ?? null,
                mediaType: dbMediaType,                // Correction du nom de colonne (mediaType au lieu de contentType)
                fileUrl: data.mediaUrl,                // Correction du nom de colonne (fileUrl au lieu de mediaUrl)
                thumbnailUrl: data.thumbnailUrl ?? null,
                isPremium: data.isPremium ?? false,
                price: data.price,                     // Pris en compte par Prisma vers Decimal
                status: PubStatus.pending_review,      // Utilisation de l'enum Prisma typé
                userId: authorId                       // Clé étrangère correcte (userId correspond à editor_id en DB)
            }
        });
    }

    /**
     * 📚 Récupération paginée du catalogue public (Uniquement les contenus publiés)
     */
    async getPublicCatalog(page: number = 1, limit: number = 20) {
        const skip = (page - 1) * limit;

        const [items, total] = await prisma.$transaction([
            prisma.contenu.findMany({
                where: {
                    status: PubStatus.published,
                    deletedAt: null // Exclure les éléments en soft-delete
                },
                skip,
                take: limit,
                orderBy: { createdAt: 'desc' },
                select: {
                    ulid: true,
                    title: true,
                    description: true,
                    mediaType: true, // Aligné sur la colonne Prisma
                    thumbnailUrl: true,
                    isPremium: true,
                    price: true,
                    createdAt: true
                }
            }),
            prisma.contenu.count({
                where: {
                    status: PubStatus.published,
                    deletedAt: null
                }
            })
        ]);

        return { items, total, page, limit };
    }
}