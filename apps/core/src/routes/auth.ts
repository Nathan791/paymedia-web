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
            password: { type: 'string', minLength: 6 },
            countryCode: { type: 'string', minLength: 2, maxLength: 2 },
            whatsappPhone: { type: 'string' }
        }
    }
}

export default async function authRoutes(fastify: FastifyInstance) {
    // Association du schéma de validation à la route /register
    fastify.post('/register', { schema: registerSchema }, authController.register)
    fastify.post('/login', authController.login)
}