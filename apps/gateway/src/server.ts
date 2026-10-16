import Fastify from 'fastify';
import cors from '@fastify/cors';
import fastifyJwt from '@fastify/jwt';

import { config } from './config';
import { registerProxies } from './proxy';
import gatewayRoutes from './routes';

const server = Fastify({
    logger: true,
});

async function start() {
    try {
        await server.register(cors, {
            origin: true,
            methods: [
                'GET',
                'POST',
                'PUT',
                'PATCH',
                'DELETE',
                'OPTIONS',
            ],
            allowedHeaders: [
                'Content-Type',
                'Authorization',
                'X-Requested-With',
            ],
        });

        await server.register(fastifyJwt, {
            secret: config.jwtSecret,
        });

        await server.register(gatewayRoutes);

        await server.register(registerProxies);

        await server.listen({
            port: config.port,
            host: config.host,
        });

        console.log(
            `PayMedia API Gateway actif sur http://${config.host}:${config.port}`
        );
    } catch (error) {
        server.log.error(error);
        process.exit(1);
    }
}

start();