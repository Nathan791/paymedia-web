import { FastifyPluginAsync } from 'fastify'

const userRoutes: FastifyPluginAsync = async (fastify): Promise<void> => {
    // Ce hook s'applique uniquement aux routes de ce fichier grâce à l'encapsulation par défaut
    fastify.addHook('onRequest', fastify.authenticate)

    // Récupérer tous les utilisateurs
    fastify.get('/', async (request, reply) => {
        const users = await fastify.db.user.findMany({
            select: { id: true, ulid: true, username: true, email: true, role: true }
        })
        return users
    })

    // Récupérer le solde du portefeuille d'un utilisateur
    fastify.get('/:id/wallet', async (request, reply) => {
        const { id } = request.params as { id: string }

        // Si votre base de données attend un id numérique, convertissez-le : Number(id)
        const wallet = await fastify.db.userWallet.findUnique({
            where: { userId: id }
        })

        if (!wallet) {
            return reply.status(404).send({ error: 'Portefeuille introuvable' })
        }

        return wallet
    })
}

export default userRoutes