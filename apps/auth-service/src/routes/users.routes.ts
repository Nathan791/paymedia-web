// routes/users.routes.ts
import { FastifyInstance } from 'fastify';
import { userService } from '../services/user.service';
import { authMiddleware } from '../middlewares/auth.middleware';
import { originMiddleware } from '../middlewares/origin.middleware';

export async function usersRoutes(fastify: FastifyInstance) {

    // ============================================================
    // RÉCUPÉRER TOUS LES UTILISATEURS
    // ============================================================
    fastify.get(
        '/api/users',
        { preHandler: [originMiddleware, authMiddleware] },
        async (request, reply) => {
            try {
                const origin = (request as any).appOrigin;
                const token = (request as any).userToken;
                const { limit } = request.query as { limit?: string };
                const data = await userService.getAll(origin, token, limit ? parseInt(limit) : 1000);
                return reply.send(data);
            } catch (error: any) {
                const status = error.response?.status || 500;
                const data = error.response?.data || { error: 'Erreur interne du serveur' };
                return reply.status(status).send(data);
            }
        }
    );

    // ============================================================
    // RÉCUPÉRER UN UTILISATEUR PAR ID
    // ============================================================
    fastify.get(
        '/api/users/:id/detail',
        { preHandler: [originMiddleware, authMiddleware] },
        async (request, reply) => {
            try {
                const origin = (request as any).appOrigin;
                const token = (request as any).userToken;
                const { id } = request.params as { id: string };
                const data = await userService.getOne(origin, token, id);
                return reply.send(data);
            } catch (error: any) {
                const status = error.response?.status || 500;
                const data = error.response?.data || { error: 'Erreur interne du serveur' };
                return reply.status(status).send(data);
            }
        }
    );

    // ============================================================
    // MODIFIER UN UTILISATEUR
    // ============================================================
    fastify.put(
        '/api/users/:id',
        { preHandler: [originMiddleware, authMiddleware] },
        async (request, reply) => {
            try {
                const origin = (request as any).appOrigin;
                const token = (request as any).userToken;
                const { id } = request.params as { id: string };
                const body = request.body;
                const data = await userService.update(origin, token, id, body);
                return reply.send(data);
            } catch (error: any) {
                const status = error.response?.status || 500;
                const data = error.response?.data || { error: 'Erreur interne du serveur' };
                return reply.status(status).send(data);
            }
        }
    );

    // ============================================================
    // SUPPRIMER UN UTILISATEUR
    // ============================================================
    fastify.delete(
        '/api/users/:id',
        { preHandler: [originMiddleware, authMiddleware] },
        async (request, reply) => {
            try {
                const origin = (request as any).appOrigin;
                const token = (request as any).userToken;
                const { id } = request.params as { id: string };
                const data = await userService.delete(origin, token, id);
                return reply.send(data);
            } catch (error: any) {
                const status = error.response?.status || 500;
                const data = error.response?.data || { error: 'Erreur interne du serveur' };
                return reply.status(status).send(data);
            }
        }
    );
}