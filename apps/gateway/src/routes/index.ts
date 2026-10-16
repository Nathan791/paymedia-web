import { FastifyInstance } from 'fastify';

export default async function gatewayRoutes(
    fastify: FastifyInstance
): Promise<void> {

    fastify.get('/health', async () => {
        return {
            success: true,
            service: 'paymedia-gateway',
            status: 'ok',
        };
    });
}