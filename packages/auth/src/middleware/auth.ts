import type {
    FastifyPluginAsync,
    FastifyReply,
    FastifyRequest,
} from 'fastify'

import fp from 'fastify-plugin'
import { verifyAccessToken } from '../jwt'
import { isSessionValid } from '../session'
import { prisma } from '@paymedia/database'

// Extension des types Fastify pour inclure `request.user` et les décorateurs globaux
declare module 'fastify' {
    interface FastifyRequest {
        user?: {
            id: number
            ulid: string
            email: string
            role: string
            jti: string
        }
    }
    interface FastifyInstance {
        verifyJWT: (request: FastifyRequest, reply: FastifyReply) => Promise<void>
        db: typeof prisma
    }
}

interface AuthMiddlewareOptions {
    jwtSecret: string
}

const authMiddleware: FastifyPluginAsync<AuthMiddlewareOptions> =
    async (fastify, options) => {
        if (!fastify.hasDecorator('db')) {
            fastify.decorate('db', prisma)
        }

        if (!fastify.hasDecorator('authenticate')) {
            fastify.decorate(
                'authenticate',
                async (
                    request: FastifyRequest,
                    reply: FastifyReply,
                ): Promise<void> => {
                    try {
                        const authHeader = request.headers.authorization

                        if (!authHeader?.startsWith('Bearer ')) {
                            reply.code(401).send({
                                error: 'Token Bearer requis.',
                            })
                            return
                        }

                        const token = authHeader.slice(7).trim()

                        if (!token) {
                            reply.code(401).send({ error: 'Token manquant.' })
                            return
                        }

                        const decoded = await verifyAccessToken(
                            token,
                            options.jwtSecret,
                        )

                        if (!(await isSessionValid(decoded.jti))) {
                            reply.code(401).send({
                                error: 'Session révoquée ou expirée.',
                            })
                            return
                        }

                        request.user = {
                            id: decoded.userId,
                            ulid: decoded.sub,
                            email: decoded.email,
                            role: decoded.roles?.[0] ?? 'reader',
                            jti: decoded.jti,
                        }
                    } catch {
                        reply.code(401).send({
                            error: 'Token invalide ou session non autorisée.',
                        })
                    }
                },
            )
        }
    }

// Exportation sécurisée avec contournement des conflits de versions des types fastify-plugin
export const authMiddlewarePlugin = fp(
    authMiddleware as any,
    { name: 'paymedia-auth-middleware' },
) as any