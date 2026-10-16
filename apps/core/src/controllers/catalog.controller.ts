// src/controllers/catalog.controller.ts
import { FastifyRequest, FastifyReply } from 'fastify';
import { CatalogService } from '../services/catalog.service';
import { PublicationSchema } from '@paymedia/schemas';

const catalogService = new CatalogService();

export class CatalogController {

    static async create(request: FastifyRequest, reply: FastifyReply) {
        try {
            // Validation stricte via le schéma partagé
            const validatedData = PublicationSchema.parse(request.body);
            const authorId = (request as any).user.sub; // Injecté par le middleware d'authentification

            const publication = await catalogService.createPublication(validatedData, authorId);
            return reply.status(201).send({ success: true, data: publication });
        } catch (error: any) {
            return reply.status(400).send({ success: false, error: error.message || error.errors });
        }
    }

    static async listPublic(request: FastifyRequest<{ Querystring: { page?: number; limit?: number } }>, reply: FastifyReply) {
        const page = Number(request.query.page) || 1;
        const limit = Number(request.query.limit) || 20;

        const catalog = await catalogService.getPublicCatalog(page, limit);
        return reply.status(200).send({ success: true, data: catalog });
    }
}