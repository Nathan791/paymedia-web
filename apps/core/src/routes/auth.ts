// apps/core/src/routes/auth.store.ts
import { FastifyInstance } from 'fastify'
import { AuthController } from '../controllers/auth.controller'

const authController = new AuthController()

const registerSchema = {
    body: {
        type: 'object',
        required: ['username', 'email', 'password', 'countryCode', 'whatsappPhone'],
        properties: {
            username: { type: 'string', minLength: 3 },
            email: { type: 'string', format: 'email' },
            password: { type: 'string', minLength: 6 }
        }
    }
}

export default async function authRoutes(fastify: FastifyInstance) {
    // Vos endpoints d'authentification
    fastify.post('/register', authController.register)
    fastify.post('/login', authController.login)
}