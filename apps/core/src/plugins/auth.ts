import { FastifyPluginAsync, FastifyRequest, FastifyReply } from 'fastify'

// Extension des types Fastify pour inclure notre décorateur
declare module 'fastify' {
    interface FastifyInstance {
        authenticate: (request: FastifyRequest, reply: FastifyReply) => Promise<void>
    }
}

const authPlugin: FastifyPluginAsync = async (fastify) => {
    // Décorateur local réutilisant le middleware de votre package principal si nécessaire,
    // ou une logique sur mesure ne dépendant pas de @fastify/jwt.
    fastify.decorate('authenticate', async (request: FastifyRequest, reply: FastifyReply) => {
        try {
            // Votre logique personnalisée ici si vous n'utilisez pas le package @paymedia/auth
        } catch (err) {
            return reply.status(401).send({ error: 'Non autorisé. Token invalide ou expiré.' })
        }
    })
}

export default authPlugin