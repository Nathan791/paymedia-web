import type { FastifyInstance } from 'fastify'
import { categoryRoutes }   from './category'
import { contentRoutes }    from './content'
import { preferenceRoutes } from './preference'

export async function registerRoutes(app: FastifyInstance): Promise<void> {
    await app.register(categoryRoutes)
    await app.register(contentRoutes)
    await app.register(preferenceRoutes)
}