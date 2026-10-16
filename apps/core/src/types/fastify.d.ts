// apps/core/src/types/fastify.d.ts
import '@fastify/jwt';
import { prisma } from '@paymedia/database';
import { FastifyRequest, FastifyReply } from 'fastify';

// 1. Surcharger la signature interne de @fastify/jwt
declare module '@fastify/jwt' {
    interface FastifyJWT {
        // C'est cette interface qui contrôle le type de request.user et request.jwtVerify()
        user: {
            id: number;
            ulid: string;
            email: string;
            role: string;
            jti: string;
        };
    }
}

// 2. Déclarer nos décorateurs personnalisés sur FastifyInstance
declare module 'fastify' {
    interface FastifyInstance {
        db: typeof prisma;
        // Décorateur unifié anti-conflit
        verifyJWT: (request: FastifyRequest, reply: FastifyReply) => Promise<void>;
    }
}