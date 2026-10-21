import { FastifyInstance } from 'fastify';
import { authRoutes } from './auth.routes.js';
import { userRoutes } from './user.route.js';
import { contentRoutes } from './content.routes.js';
import { dashboardRoutes } from './dashboard.routes.js';
import { transactionRoutes } from './transaction.routes.js';
import { commissionRoutes } from './commission.routes.js';

export async function registerRoutes(fastify: FastifyInstance) {
    // Health check
    fastify.get('/health', async (_request, reply) => {
        return reply.send({
            status: 'OK',
            service: 'admin-mock',
            timestamp: new Date().toISOString(),
        });
    });

    // Routes
    await fastify.register(authRoutes, { prefix: '/api/admin/auth' });
    await fastify.register(userRoutes, { prefix: '/api/admin/users' });
    await fastify.register(contentRoutes, { prefix: '/api/admin/contents' });
    await fastify.register(dashboardRoutes, { prefix: '/api/admin/dashboard' });
    await fastify.register(transactionRoutes, { prefix: '/api/admin/transactions' });
    await fastify.register(commissionRoutes, { prefix: '/api/admin/commissions' });
}