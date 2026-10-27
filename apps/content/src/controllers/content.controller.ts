import type { FastifyRequest, FastifyReply } from 'fastify'
import { createReadStream } from 'node:fs'
import { basename, extname, isAbsolute } from 'node:path'
import { ContentCreateSchema, ContentUpdateSchema, ContentFilterSchema } from '@paymedia/schemas'
import * as contentService from '../services/content.service'
import { saveFile, validateMimeType, validateCoverMimeType } from '../uploads/file.handler'
import { config } from '../config'

const ts = () => new Date().toISOString()

function currentUserId(request: FastifyRequest): number | null {
    const user = (request as any).user
    const id = Number(user?.userId ?? user?.id ?? user?.sub)
    return Number.isInteger(id) && id > 0 ? id : null
}

export async function listContents(request: FastifyRequest, reply: FastifyReply): Promise<void> {
    const filters = ContentFilterSchema.parse(request.query)
    const result = await contentService.listContents(filters)
    reply.send({ data: result.items, total: result.total, page: result.page, limit: result.limit, timestamp: ts() })
}

export async function listMyContents(request: FastifyRequest, reply: FastifyReply): Promise<void> {
    const userId = currentUserId(request)
    if (!userId) {
        reply.status(401).send({ code: 'UNAUTHENTICATED', message: 'Authentication required', timestamp: ts() })
        return
    }
    const filters = ContentFilterSchema.parse(request.query)
    const result = await contentService.listMyContents(userId, filters)
    reply.send({ data: result.items, total: result.total, page: result.page, limit: result.limit, timestamp: ts() })
}

export async function getContent(request: FastifyRequest, reply: FastifyReply): Promise<void> {
    const { id } = request.params as { id: string }
    const userId = currentUserId(request)
    if (!userId) {
        reply.status(401).send({ code: 'UNAUTHENTICATED', message: 'Authentication required', timestamp: ts() })
        return
    }
    try {
        const content = await contentService.getContent(id, userId)
        reply.send({ data: content, timestamp: ts() })
    } catch (err: any) {
        if (err.message === 'NOT_FOUND') {
            reply.status(404).send({ code: 'NOT_FOUND', message: 'Content not found', timestamp: ts() })
            return
        }
        if (err.message === 'FORBIDDEN') {
            reply.status(403).send({ code: 'FORBIDDEN', message: 'Not authorized', timestamp: ts() })
            return
        }
        throw err
    }
}

export async function createContent(request: FastifyRequest, reply: FastifyReply): Promise<void> {
    const userId = currentUserId(request)
    if (!userId) {
        reply.status(401).send({ code: 'UNAUTHENTICATED', message: 'Authentication required', timestamp: ts() })
        return
    }

    const fields: Record<string, string> = {}
    let fileUrl: string | undefined
    let coverUrl: string | undefined

    for await (const part of (request as any).parts()) {
        if (part.type === 'file') {
            if (part.fieldname === 'cover_image') {
                if (!validateCoverMimeType(part.mimetype)) {
                    reply.status(400).send({ code: 'INVALID_COVER_TYPE', message: 'Cover must be a JPEG, PNG or WebP image', timestamp: ts() })
                    return
                }
                coverUrl = await saveFile(part, config.uploadsDir)
                continue
            }

            if (part.fieldname !== 'files') {
                reply.status(400).send({ code: 'UNEXPECTED_FILE_FIELD', message: 'Use the files field for the main content or cover_image for its cover', timestamp: ts() })
                return
            }

            const mediaType = fields.mediaType ?? ''
            if (!validateMimeType(mediaType, part.mimetype)) {
                reply.status(400).send({ code: 'INVALID_FILE_TYPE', message: `File type not allowed for mediaType ${mediaType}`, timestamp: ts() })
                return
            }
            fileUrl = await saveFile(part, config.uploadsDir)
        } else {
            fields[part.fieldname] = String(part.value ?? '')
        }
    }

    if (!fileUrl) {
        reply.status(400).send({ code: 'FILE_REQUIRED', message: 'Main content file is required in the files field', timestamp: ts() })
        return
    }

    const rawInput = {
        ...fields,
        ...(fields.categoryId ? { categoryId: Number(fields.categoryId) } : {}),
        price: Number(fields.price ?? 0),
        isPremium: fields.isPremium === 'true',
        ...(fields.freeStartPage ? { freeStartPage: Number(fields.freeStartPage) } : {}),
        ...(fields.freeEndPage ? { freeEndPage: Number(fields.freeEndPage) } : {}),
        ...(fields.freePreviewDuration ? { freePreviewDuration: Number(fields.freePreviewDuration) } : {}),
    }
    const input = ContentCreateSchema.parse(rawInput)
    const content = await contentService.createContent(userId, input, fileUrl, coverUrl)
    reply.status(201).send({ data: content, timestamp: ts() })
}

export async function updateContent(request: FastifyRequest, reply: FastifyReply): Promise<void> {
    const { id } = request.params as { id: string }
    const userId = currentUserId(request)
    if (!userId) {
        reply.status(401).send({ code: 'UNAUTHENTICATED', message: 'Authentication required', timestamp: ts() })
        return
    }

    let rawInput: Record<string, unknown>
    let fileUrl: string | undefined
    let coverUrl: string | undefined

    if ((request as any).isMultipart()) {
        const fields: Record<string, string> = {}
        for await (const part of (request as any).parts()) {
            if (part.type === 'file') {
                if (part.fieldname === 'cover_image') {
                    if (!validateCoverMimeType(part.mimetype)) {
                        reply.status(400).send({ code: 'INVALID_COVER_TYPE', message: 'Cover must be a JPEG, PNG or WebP image', timestamp: ts() })
                        return
                    }
                    coverUrl = await saveFile(part, config.uploadsDir)
                    continue
                }
                if (part.fieldname !== 'files') {
                    reply.status(400).send({ code: 'UNEXPECTED_FILE_FIELD', message: 'Use files or cover_image for uploads', timestamp: ts() })
                    return
                }
                const mediaType = fields.mediaType ?? ''
                if (!validateMimeType(mediaType, part.mimetype)) {
                    reply.status(400).send({ code: 'INVALID_FILE_TYPE', message: `File type not allowed for mediaType ${mediaType}`, timestamp: ts() })
                    return
                }
                fileUrl = await saveFile(part, config.uploadsDir)
            } else {
                fields[part.fieldname] = String(part.value ?? '')
            }
        }
        rawInput = {
            ...fields,
            ...(fields.categoryId ? { categoryId: Number(fields.categoryId) } : {}),
            ...(fields.price !== undefined ? { price: Number(fields.price) } : {}),
            ...(fields.isPremium !== undefined ? { isPremium: fields.isPremium === 'true' } : {}),
            ...(fields.freeStartPage ? { freeStartPage: Number(fields.freeStartPage) } : {}),
            ...(fields.freeEndPage ? { freeEndPage: Number(fields.freeEndPage) } : {}),
            ...(fields.freePreviewDuration ? { freePreviewDuration: Number(fields.freePreviewDuration) } : {}),
        }
    } else {
        rawInput = (request.body ?? {}) as Record<string, unknown>
    }

    const input = ContentUpdateSchema.parse(rawInput)
    try {
        const content = await contentService.updateContent(id, userId, input, fileUrl, coverUrl)
        reply.send({ data: content, timestamp: ts() })
    } catch (err: any) {
        if (err.message === 'NOT_FOUND') {
            reply.status(404).send({ code: 'NOT_FOUND', message: 'Content not found', timestamp: ts() })
            return
        }
        if (err.message === 'FORBIDDEN') {
            reply.status(403).send({ code: 'FORBIDDEN', message: 'Not authorized', timestamp: ts() })
            return
        }
        throw err
    }
}

export async function deleteContent(request: FastifyRequest, reply: FastifyReply): Promise<void> {
    const { id } = request.params as { id: string }
    const userId = currentUserId(request)
    if (!userId) {
        reply.status(401).send({ code: 'UNAUTHENTICATED', message: 'Authentication required', timestamp: ts() })
        return
    }

    try {
        await contentService.deleteContent(id, userId)
        reply.status(204).send()
    } catch (err: any) {
        if (err.message === 'NOT_FOUND') {
            reply.status(404).send({ code: 'NOT_FOUND', message: 'Content not found', timestamp: ts() })
            return
        }
        if (err.message === 'FORBIDDEN') {
            reply.status(403).send({ code: 'FORBIDDEN', message: 'Not authorized', timestamp: ts() })
            return
        }
        throw err
    }
}

export async function getMedia(request: FastifyRequest, reply: FastifyReply): Promise<void> {
    const { filename: rawFilename } = request.params as { filename: string }
    const filename = basename(rawFilename)
    if (!filename || filename !== rawFilename || filename.includes('..')) {
        reply.status(400).send({ code: 'INVALID_FILENAME', message: 'Invalid media filename', timestamp: ts() })
        return
    }

    const media = await contentService.getMediaByFilename(filename)
    if (!media) {
        reply.status(404).send({ code: 'NOT_FOUND', message: 'Media not found', timestamp: ts() })
        return
    }

    const userId = currentUserId(request)
    if (media.status !== 'published' && (!userId || media.userId !== userId)) {
        reply.status(403).send({ code: 'FORBIDDEN', message: 'Not authorized to access this media', timestamp: ts() })
        return
    }

    const storedPath = [media.fileUrl, media.coverUrl, media.thumbnailUrl]
        .find((value) => value && basename(value) === filename)
    if (!storedPath || !isAbsolute(storedPath)) {
        reply.status(404).send({ code: 'NOT_FOUND', message: 'Media file path is unavailable', timestamp: ts() })
        return
    }

    const mimeTypes: Record<string, string> = {
        '.epub': 'application/epub+zip',
        '.mp3': 'audio/mpeg',
        '.mpeg': 'audio/mpeg',
        '.mp4': 'video/mp4',
        '.m4a': 'audio/mp4',
        '.ogg': 'application/ogg',
        '.webm': 'video/webm',
        '.wav': 'audio/wav',
        '.jpg': 'image/jpeg',
        '.jpeg': 'image/jpeg',
        '.png': 'image/png',
        '.webp': 'image/webp',
        '.mov': 'video/quicktime',
    }
    reply.type(mimeTypes[extname(filename).toLowerCase()] ?? 'application/octet-stream')
    reply.header('Content-Disposition', 'inline')
    reply.send(createReadStream(storedPath))
}
