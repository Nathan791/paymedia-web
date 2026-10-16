// apps/core/src/controllers/auth.controller.ts
import { FastifyRequest, FastifyReply } from 'fastify'
import { AuthService } from '../services/auth.service'

// Extension des types Fastify pour corriger l'erreur TS2339
declare module 'fastify' {
    interface FastifyInstance {
        jwt: {
            sign(payload: any, options?: any): string
            verify(token: string, options?: any): any
        }
    }
}

const authService = new AuthService()

// Définition des interfaces pour le typage strict des requêtes
interface RegisterBody {
    username: string
    email: string
    password: string
    countryCode: string
    whatsappPhone: string
}

interface LoginBody {
    email: string
    password: string
}

export class AuthController {

    async register(request: FastifyRequest<{ Body: RegisterBody }>, reply: FastifyReply) {
        try {
            const user = await authService.registerUser(request.body)
            return reply.status(201).send({ message: 'Utilisateur créé avec succès', user })
        } catch (error: any) {
            return reply.status(400).send({ error: error.message })
        }
    }

    async login(request: FastifyRequest<{ Body: LoginBody }>, reply: FastifyReply) {
        try {
            const { user, sessionJti } = await authService.loginUser(request.body)

            // Génération du JWT via le plugin fastify-jwt ou votre instance d'authentification
            // Note : Si vous utilisez 'decoratorName: jwtUser', remplacez .jwt par .jwtUser
            const token = request.server.jwt.sign({
                sub: user.id,
                ulid: user.ulid,
                //role: user.role,
                jti: sessionJti
            }, { expiresIn: '24h' })

            return reply.send({
                token,
                user: {
                    ulid: user.ulid,
                    username: user.username,
                    email: user.email,
                    //role: user.role
                }
            })
        } catch (error: any) {
            return reply.status(401).send({ error: error.message })
        }
    }
}