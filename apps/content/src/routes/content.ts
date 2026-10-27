import type { FastifyInstance } from 'fastify'
import * as contentController from '../controllers/content.controller'

export async function contentRoutes(app: FastifyInstance): Promise<void> {
    // Route statique avant /content/:id pour lever toute ambiguïté.
    app.get   ('/content/my-contents', contentController.listMyContents)
    app.get   ('/content',             contentController.listContents)
    app.get   ('/content/:id',         contentController.getContent)
    app.post  ('/content',             contentController.createContent)
    app.patch ('/content/:id',         contentController.updateContent)
    app.delete('/content/:id',         contentController.deleteContent)
}
