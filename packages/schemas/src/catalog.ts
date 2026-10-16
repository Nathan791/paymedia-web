// packages/schemas/src/catalog.ts
import { z } from 'zod';

export const ContentTypeEnum = z.enum(['epub', 'pdf', 'audio', 'video']);
export const PubStatusEnum = z.enum(['draft', 'pending_review', 'published', 'rejected', 'archived']);

export const PublicationSchema = z.object({
    title: z.string().max(255),
    description: z.string().optional(),
    contentType: ContentTypeEnum,
    mediaUrl: z.string().url().max(512),
    thumbnailUrl: z.string().url().max(512).optional(),
    categoryId: z.number().int().optional(),
    isPremium: z.boolean().default(false),
    price: z.number().positive().default(0.00),
});