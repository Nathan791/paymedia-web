import { FastifyPluginAsync } from 'fastify'
import { prisma } from '@paymedia/database'

// Déclaration de type pour étendre l'instance Fastify
declare module 'fastify' {
    interface FastifyInstance {
        db: typeof prisma
    }
}

const prismaPlugin: FastifyPluginAsync = async (fastify) => {
    // Note : Sans fastify-plugin, ce décorateur sera encapsulé.
    // Si vous l'utilisez en dehors de ce contexte de plugin,
    // préférez conserver fastify-plugin pour casser l'isolation.
    fastify.decorate('db', prisma)

    // Fermeture propre de la connexion à la fermeture de l'API
    fastify.addHook('onClose', async (server) => {
        await server.db.$disconnect()
    })
}

export default prismaPlugin