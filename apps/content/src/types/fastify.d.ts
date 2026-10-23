// src/types/fastify.d.ts
import 'fastify';

declare module 'fastify' {
    interface FastifyRequest {
        user?: {
            userId: number;
            email?: string;
            role?: string;
            [key: string]: any;
        };
    }
}