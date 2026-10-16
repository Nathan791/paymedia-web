import { FastifyInstance } from 'fastify';
import { mockTransactions } from '../mock/data';

export async function transactionRoutes(fastify: FastifyInstance) {
    //  Liste des transactions
    fastify.get('/', { preHandler: [fastify.authenticate] }, async (request, reply) => {
        const { type = 'all', status = 'all' } = request.query as any;

        let filtered = [...mockTransactions];

        if (type !== 'all') {
            filtered = filtered.filter((t) => t.type === type);
        }

        if (status !== 'all') {
            filtered = filtered.filter((t) => t.status === status);
        }

        return reply.send({
            success: true,
            message: 'Transactions récupérées',
            data: {
                transactions: filtered,
                total: filtered.length,
            },
        });
    });
}