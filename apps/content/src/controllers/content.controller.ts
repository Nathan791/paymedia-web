import type { FastifyRequest, FastifyReply } from 'fastify'
import { ContentCreateSchema, ContentUpdateSchema, ContentFilterSchema } from '@paymedia/schemas'
import * as contentService from '../services/content.service'
import { saveFile, validateMimeType } from '../uploads/file.handler'
import { config } from '../config'

const ts = () => new Date().toISOString()

export async function listContents(request: FastifyRequest, reply: FastifyReply): Promise<void> {
    const filters = ContentFilterSchema.parse(request.query)
    const result  = await contentService.listContents(filters)
    reply.send({ data: result.items, total: result.total, page: result.page, limit: result.limit, timestamp: ts() })
}

export async function getContent(request: FastifyRequest, reply: FastifyReply): Promise<void> {
    const { id } = request.params as { id: string }
    try {
        const content = await contentService.getContent(id)
        reply.send({ data: content, timestamp: ts() })
    } catch (err: any) {
        if (err.message === 'NOT_FOUND') { reply.status(404).send({ code: 'NOT_FOUND', message: 'Content not found', timestamp: ts() }); return }
        throw err
    }
}

export async function createContent(request: FastifyRequest, reply: FastifyReply): Promise<void> {
    // Les champs multipart arrivent via parts()
    const parts = (request as any).parts()
    const fields: Record<string, string> = {}
    let fileUrl = ''

    for await (const part of parts) {
        if (part.type === 'file') {
            const mediaType = fields['media_type'] ?? ''
            if (!validateMimeType(mediaType, part.mimetype)) {
                reply.status(400).send({ code: 'INVALID_FILE_TYPE', message: `File type not allowed for media_type ${mediaType}`, timestamp: ts() })
                return
            }
            fileUrl = await saveFile(part, config.uploadsDir)
        } else {
            fields[part.fieldname] = part.value as string
        }
    }

    if (!fileUrl) {
        reply.status(400).send({ code: 'FILE_REQUIRED', message: 'File is required', timestamp: ts() })
        return
    }

    const input = ContentCreateSchema.parse({
        ...fields,
        category_id: parseInt(fields['category_id'] ?? '0'),
        price:       parseFloat(fields['price'] ?? '0'),
    })

    const userId = (request as any).user?.userId ?? (request as any).user?.id
    const content = await contentService.createContent(userId, input, fileUrl)
    reply.status(201).send({ data: content, timestamp: ts() })
}

export async function updateContent(request: FastifyRequest, reply: FastifyReply): Promise<void> {
    const { id } = request.params as { id: string }
    const input  = ContentUpdateSchema.parse(request.body)
    try {
        const userId = (request as any).user?.userId ?? (request as any).user?.id
        const content = await contentService.updateContent(id, userId, input)
        reply.send({ data: content, timestamp: ts() })
    } catch (err: any) {
        if (err.message === 'NOT_FOUND') { reply.status(404).send({ code: 'NOT_FOUND', message: 'Content not found', timestamp: ts() }); return }
        if (err.message === 'FORBIDDEN')  { reply.status(403).send({ code: 'FORBIDDEN',  message: 'Not authorized',    timestamp: ts() }); return }
        throw err
    }
}

export async function deleteContent(request: FastifyRequest, reply: FastifyReply): Promise<void> {
    const { id } = request.params as { id: string }
    try {
        const userId = (request as any).user?.userId ?? (request as any).user?.id
        await contentService.deleteContent(id, userId)
        reply.status(204).send()
    } catch (err: any) {
        if (err.message === 'NOT_FOUND') { reply.status(404).send({ code: 'NOT_FOUND', message: 'Content not found', timestamp: ts() }); return }
        if (err.message === 'FORBIDDEN')  { reply.status(403).send({ code: 'FORBIDDEN',  message: 'Not authorized',    timestamp: ts() }); return }
        throw err
    }
}