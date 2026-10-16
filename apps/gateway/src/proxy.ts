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
     *
     * Gateway:
     * /api/auth/*
     *
     * Auth Service:
     * http://localhost:4000/api/auth/*
     */

    await fastify.register(replyFrom, {
        base: 'http://localhost:4000',
        prefix: '/api/auth',
        rewriteRequestHeaders: (request, headers) => {
            return {
                ...headers,
                host: 'localhost:4000',
            };
        },
    });

    /*
     * CATALOG SERVICE
     *
     * À adapter au port réel du Catalog Service.
     */

    await fastify.register(replyFrom, {
        base: 'http://localhost:4001',
        prefix: '/api/catalog',
        rewriteRequestHeaders: async (request, headers) => {
            const user = await validateUser(fastify, request);

            return {
                ...headers,
                host: 'localhost:4001',
                ...(user
                    ? {
                        'x-user-id': String(
                            user.id ?? user.sub ?? ''
                        ),
                        'x-user-email': user.email ?? '',
                        'x-user-role':
                            user.role ??
                            user.roles?.[0] ??
                            '',
                    }
                    : {}),
            };
        },
    });

    /*
     * CORE SERVICE
     */

    await fastify.register(replyFrom, {
        base: 'http://localhost:4002',
        prefix: '/api/core',
        rewriteRequestHeaders: async (request, headers) => {
            const user = await validateUser(fastify, request);

            return {
                ...headers,
                host: 'localhost:4002',
                ...(user
                    ? {
                        'x-user-id': String(
                            user.id ?? user.sub ?? ''
                        ),
                        'x-user-email': user.email ?? '',
                        'x-user-role':
                            user.role ??
                            user.roles?.[0] ??
                            '',
                    }
                    : {}),
            };
        },
    });

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