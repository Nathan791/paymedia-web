import { z } from 'zod'
import { NonEmptyString } from './primitives'

// Enums alignés avec Prisma
export const MediaTypeEnum = z.enum(['epub', 'audio', 'video'])
export const PubStatusEnum = z.enum(['draft', 'pending_review', 'published', 'rejected', 'archived'])

// Category Schema
export const CategoryCreateSchema = z.object({
    name: NonEmptyString.max(100),
    slug: z.string().max(100).optional(),
    description: NonEmptyString.max(100),
})

export type CategoryCreate = z.infer<typeof CategoryCreateSchema>

// Content Schema
export const ContentCreateSchema = z.object({
    title: NonEmptyString.max(255),
    description: z.string().optional(),
    mediaType: MediaTypeEnum,
    categoryId: z.coerce.number().int().positive().optional(),
    price: z.coerce.number().min(0).default(0),
    isPremium: z.coerce.boolean().default(false),
    freeStartPage: z.coerce.number().int().positive().optional(),
    freeEndPage: z.coerce.number().int().positive().optional(),
    freePreviewDuration: z.coerce.number().int().min(0).optional(),
})

export const ContentUpdateSchema = ContentCreateSchema.partial()

export const ContentFilterSchema = z.object({
    categoryId: z.coerce.number().int().positive().optional(),
    mediaType: MediaTypeEnum.optional(),
    page: z.coerce.number().int().min(1).default(1),
    limit: z.coerce.number().int().min(1).max(100).default(20),
})

export type ContentCreate = z.infer<typeof ContentCreateSchema>
export type ContentUpdate = z.infer<typeof ContentUpdateSchema>
export type ContentFilter = z.infer<typeof ContentFilterSchema>

// Preference Schema aligné avec Tag (tag_id)
export const PreferenceParamSchema = z.object({
    tag_id: z.coerce.number().int().positive(),
})

export type PreferenceParam = z.infer<typeof PreferenceParamSchema>