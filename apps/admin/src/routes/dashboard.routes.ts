import { FastifyInstance } from 'fastify';
import { mockStats, mockUsers, mockContents, mockTransactions } from '../mock/data.js';

export async function dashboardRoutes(fastify: FastifyInstance) {
    // Statistiques
    fastify.get('/stats', { preHandler: [fastify.authenticate] }, async (_request, reply) => {
        const totalRevenue = mockTransactions
            .filter((t) => t.type === 'purchase' && t.status === 'completed')
            .reduce((sum, t) => sum + t.amount, 0);

        const totalRecharges = mockTransactions
            .filter((t) => t.type === 'recharge' && t.status === 'completed')
            .reduce((sum, t) => sum + t.amount, 0);

        return reply.send({
            success: true,
            message: 'Statistiques récupérées',
            data: {
                totalUsers: mockUsers.length,
                activeUsers: mockUsers.filter((u) => u.isActive).length,
                totalContents: mockContents.length,
                publishedContents: mockContents.filter((c) => c.status === 'published').length,
                pendingModeration: mockContents.filter((c) => c.status === 'pending').length,
                totalRevenue,
                totalRecharges,
                totalTransactions: mockTransactions.length,
                alerts: mockStats.alerts.length,
                recentTransactions: mockStats.recentTransactions,
            },
        });
    });

    // Alertes
    fastify.get('/alerts', { preHandler: [fastify.authenticate] }, async (_request, reply) => {
        return reply.send({
            success: true,
            message: 'Alertes récupérées',
            data: mockStats.alerts,
        });
    });

    // Transactions récentes
    fastify.get('/recent-transactions', { preHandler: [fastify.authenticate] }, async (_request, reply) => {
        const recent = mockTransactions.slice(0, 5);
        return reply.send({
            success: true,
            message: 'Transactions récentes récupérées',
            data: recent,
        });
    });
}