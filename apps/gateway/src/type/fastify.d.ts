import 'fastify';
import '@fastify/jwt';

declare module 'fastify' {
    interface FastifyRequest {
        userPayload?: {
            id?: number | string;
            sub?: string | number;
            email?: string;
            role?: string;
            roles?: string[];
            jti?: string;
        };
    }
}