import type { FastifyRequest, FastifyReply } from 'fastify'
import { CategoryCreateSchema } from '@paymedia/schemas'
import * as categoryService from '../services/category.service'

const ts = () => new Date().toISOString()

export async function listCategories(_request: FastifyRequest, reply: FastifyReply): Promise<void> {
    const categories = await categoryService.listCategories()
    reply.send({ data: categories, timestamp: ts() })
}

export async function getCategory(request: FastifyRequest, reply: FastifyReply): Promise<void> {
    const { id } = request.params as { id: string }
    try {
        const cat = await categoryService.getCategory(id)
        reply.send({ data: cat, timestamp: ts() })
    } catch (err: any) {
        if (err.message === 'NOT_FOUND') { reply.status(404).send({ code: 'NOT_FOUND', message: 'Category not found', timestamp: ts() }); return }
        throw err
    }
}

export async function createCategory(request: FastifyRequest, reply: FastifyReply): Promise<void> {
    const input = CategoryCreateSchema.parse(request.body)
    try {
        const cat = await categoryService.createCategory(input)
        reply.status(201).send({ data: cat, timestamp: ts() })
    } catch (err: any) {
        if (err.message === 'SLUG_TAKEN') { reply.status(409).send({ code: 'SLUG_TAKEN', message: 'Slug already in use', timestamp: ts() }); return }
        throw err
    }
}
