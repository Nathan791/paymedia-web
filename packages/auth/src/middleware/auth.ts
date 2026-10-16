// packages/auth/src/middleware/auth.store.ts
import { FastifyInstance, FastifyReply, FastifyRequest } from 'fastify';
import { verifyAccessToken } from '../jwt';
import { isSessionValid } from '../session';
import { prisma } from "@paymedia/database";

declare module 'fastify' {
    interface FastifyInstance {
        db: typeof prisma;
        // FIX : Renommé en verifyJWT pour éviter le conflit avec @fastify/jwt
        verifyJWT: (request: FastifyRequest, reply: FastifyReply) => Promise<void>;
    }
    interface FastifyRequest {
        // FIX : Déclaration de 'user' requise par la compilation interne de packages/auth
        user: {
            id: number;
            ulid: string;
            email: string;
            role: string;
            jti: string;
        };
    }
}

export const authMiddlewarePlugin = fp(async (fastify: FastifyInstance, options: { jwtSecret: string }) => {


    fastify.decorate('verifyJWT', async (request: FastifyRequest, reply: FastifyReply) => {
        try {
            const authHeader = request.headers.authorization;
            if (!authHeader || !authHeader.startsWith('Bearer ')) {
                return reply.status(401).send({ error: 'Format de token invalide (Bearer token requis).' });
            }

            const token = authHeader.split(' ')[1];

            // 1. Validation de la signature du JWT via jose (jwt.ts)
            const decoded = await verifyAccessToken(token, options.jwtSecret);

            // 2. Vérification de la validité de la session (jti) en base de données
            const isValid = await isSessionValid(decoded.jti);
            if (!isValid) {
                return reply.status(401).send({ error: 'Session révoquée ou expirée.' });
            }

            // 3. Injection des données utilisateur typées dans la requête
            request.user = {
                id: decoded.userId, // FIX : Plus de "Number(decoded.sub)" qui renvoie NaN !
                ulid: decoded.sub,
                email: decoded.email,
                role: decoded.roles?.[0] || 'reader',
                jti: decoded.jti
            };
        } catch (err: any) {
            return reply.status(401).send({ error: err.message || 'Non autorisé.' });
        }
    });
});