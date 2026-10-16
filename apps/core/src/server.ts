import Fastify from 'fastify'
import autoLoad from '@fastify/autoload'
import cors from '@fastify/cors'
import { join } from 'path'

const start = async () => {
    const fastify = Fastify({ logger: true })

    // 1. Enregistrer CORS
    await fastify.register(cors, { origin: '*' })

    // 2. Enregistrer automatiquement nos plugins personnalisés (Prisma, etc.)
    await fastify.register(autoLoad, {
        dir: join(__dirname, 'plugins')
    })

    // 3. Enregistrer automatiquement nos routes
    await fastify.register(autoLoad, {
        dir: join(__dirname, 'routes'),
        routeParams: true
    })

    try {
        const port = Number(process.env.PORT) || 4000
        await fastify.listen({ port, host: '127.0.0.1' })
        console.log(`🚀 API disponible sur http://localhost:${port}`)
    } catch (err) {
        fastify.log.error(err)
        process.exit(1)
    }
}

start()