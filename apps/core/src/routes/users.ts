// users.ts
import type { FastifyPluginAsync } from 'fastify'

const userRoutes: FastifyPluginAsync = async (fastify): Promise<void> => {
    // S'applique uniquement aux routes de ce fichier (encapsulation Fastify)
    fastify.addHook('onRequest', fastify.authenticate)

    // Récupérer tous les utilisateurs
    fastify.get('/', async () => {
        return fastify.db.user.findMany({
            select: { id: true, ulid: true, username: true, email: true, role: true },
        })
    })

    // Récupérer le portefeuille d'un utilisateur
    fastify.get<{ Params: { id: string } }>('/:id/wallet', async (request, reply) => {
        const userId = Number(request.params.id)

        if (!Number.isInteger(userId)) {
            return reply.status(400).send({ error: 'Identifiant invalide' })
        }

        const user = await fastify.db.user.findUnique({
            where: { id: userId },
            select: { wallet: true },
        })

        if (!user?.wallet) {
            return reply.status(404).send({ error: 'Portefeuille introuvable' })
        }

        return user.wallet
    })
}

export default userRoutes