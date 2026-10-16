// apps/core/src/routes/index.tsx
import { FastifyInstance } from 'fastify'
import authRoutes from './auth'
import userRoutes from "./users";

export default async function rootRoutes(fastify: FastifyInstance) {
    // On enregistre les routes auth sous le préfixe /auth
    await fastify.register(authRoutes, { prefix: '/auth' })

    // Vous pouvez enregistrer les autres routes ici (ex: /users, /otp, etc.)
}