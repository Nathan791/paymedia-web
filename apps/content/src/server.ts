import 'dotenv/config'
import Fastify from 'fastify'
import multipart from '@fastify/multipart'
import { z } from '@paymedia/schemas'
import { createLogger } from '@paymedia/logger'
import { buildAuthMiddleware } from '@paymedia/auth'
import { config } from './config'
import { registerRoutes } from './routes/index'

const logger = createLogger('catalog')

const PUBLIC_ROUTES = new Set([
    'GET:/health',
    'GET:/category',
    'GET:/category/:id',
    'GET:/content',
])

async function bootstrap(): Promise<void> {
    const app = Fastify({ logger: false })

    await app.register(multipart, {
        limits: { fileSize: 500 * 1024 * 1024, files: 2, fields: 20 },
        attachFieldsToBody: false,
    })

    const authMiddleware = buildAuthMiddleware({ jwtSecret: config.jwtSecret })

    app.addHook('preHandler', async (request, reply) => {
        const route = request.routeOptions.url ?? request.url
        const key = `${request.method}:${route}`
        if (PUBLIC_ROUTES.has(key)) return
        return authMiddleware(request, reply)
    })

    app.addHook('onRequest', (req, _res, done) => {
        logger.info({ method: req.method, url: req.url }, 'request')
        done()
    })

    app.setErrorHandler((error, request, reply) => {
        if (error instanceof z.ZodError) {
            const details = error.issues.map((e) => ({ field: e.path.join('.'), message: e.message }))
            reply.status(400).send({ code: 'VALIDATION_ERROR', message: 'Validation failed', details, timestamp: new Date().toISOString() })
            return
        }
        logger.error({ err: error, url: request.url }, 'unhandled error')
        reply.status(500).send({ code: 'INTERNAL_ERROR', message: 'Internal server error', timestamp: new Date().toISOString() })
    })

    app.get('/health', async (_req, reply) => {
        reply.send({ status: 'ok', service: 'catalog', uptime: process.uptime(), timestamp: new Date().toISOString() })
    })

    await registerRoutes(app)
    await app.listen({ port: config.port, host: '127.0.0.1' })
    logger.info(`Catalog service listening on port ${config.port}`)
}

bootstrap().catch(async (err) => {
    logger.error({ err }, 'fatal startup error')
    process.exit(1)
})
