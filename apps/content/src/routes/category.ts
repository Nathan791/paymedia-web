import type { FastifyInstance } from 'fastify'
import * as categoryController from '../controllers/category.controller'

export async function categoryRoutes(app: FastifyInstance): Promise<void> {
    app.get ('/category',     categoryController.listCategories)
    app.get ('/category/:id', categoryController.getCategory)
    app.post('/category',     categoryController.createCategory)
}
