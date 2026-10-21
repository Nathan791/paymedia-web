import { FastifyInstance, FastifyRequest } from 'fastify';
import replyFrom from '@fastify/reply-from';

interface JwtPayload {
    id?: number | string;
    sub?: string | number;
    email?: string;
    role?: string;
    roles?: string[];
    jti?: string;
}

function extractToken(request: FastifyRequest): string | null {
    const authorization = request.headers.authorization;

    if (!authorization) {
        return null;
    }

    if (!authorization.startsWith('Bearer ')) {
        return null;
    }

    return authorization.substring(7);
}

async function validateUser(
    fastify: FastifyInstance,
    request: FastifyRequest
): Promise<JwtPayload | null> {
    const token = extractToken(request);

    if (!token) {
        return null;
    }

    try {
        const decoded = await fastify.jwt.verify<JwtPayload>(token);

        return decoded;
    } catch {
        return null;
    }
}

export async function registerProxies(fastify: FastifyInstance) {
    /*
     * AUTH SERVICE
     * Gateway: /api/auth/*
     * Auth Service: http://localhost:4000/api/auth/*
     */

    await fastify.register(replyFrom, {
        base: 'http://localhost:4000',
        prefix: '/api/auth',
    });

    /*
     * CATALOG SERVICE
     */

    await fastify.register(async (instance) => {
        instance.addHook('onRequest', async (request) => {
            const user = await validateUser(fastify, request);
            if (user) {
                request.headers['x-user-id'] = String(user.id ?? user.sub ?? '');
                request.headers['x-user-email'] = user.email ?? '';
                request.headers['x-user-role'] = user.role ?? user.roles?.[0] ?? '';
            }
            request.headers['host'] = 'localhost:4001';
        });

        await instance.register(replyFrom, {
            base: 'http://localhost:4001',
        });
    }, { prefix: '/api/catalog' });

    /*
     * CORE SERVICE
     */

    await fastify.register(async (instance) => {
        instance.addHook('onRequest', async (request) => {
            const user = await validateUser(fastify, request);
            if (user) {
                request.headers['x-user-id'] = String(user.id ?? user.sub ?? '');
                request.headers['x-user-email'] = user.email ?? '';
                request.headers['x-user-role'] = user.role ?? user.roles?.[0] ?? '';
            }
            request.headers['host'] = 'localhost:4002';
        });

        await instance.register(replyFrom, {
            base: 'http://localhost:4002',
        });
    }, { prefix: '/api/core' });

    /*
     * HEALTH CHECK
     */

    fastify.get('/health', async () => {
        return {
            success: true,
            service: 'paymedia-gateway',
            status: 'ok',
            timestamp: new Date().toISOString(),
        };
    });

}