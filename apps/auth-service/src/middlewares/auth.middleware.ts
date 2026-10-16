// middlewares/auth.middleware.ts
import { FastifyRequest, FastifyReply } from 'fastify';

export const authMiddleware = async (request: FastifyRequest, reply: FastifyReply) => {
    try {
        const authHeader = request.headers.authorization;
        const token = authHeader?.replace('Bearer ', '');

        if (!token) {
            return reply.status(401).send({
                error: 'Token manquant',
                message: 'Vous devez être authentifié pour accéder à cette ressource'
            });
        }

        (request as any).userToken = token;
    } catch (error) {
        return reply.status(401).send({ error: 'Token invalide' });
    }
};