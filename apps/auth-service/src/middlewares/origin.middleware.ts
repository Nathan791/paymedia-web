// middlewares/origin.middleware.ts
import { FastifyRequest, FastifyReply } from 'fastify';
import { detectOrigin } from '../config/origins';

export const originMiddleware = async (request: FastifyRequest, reply: FastifyReply) => {
    const originHeader = request.headers['x-app-origin'] as string | undefined;
    const origin = detectOrigin(originHeader);

    // Stocker l'origine dans request pour l'utiliser dans les routes
    (request as any).appOrigin = origin;

};