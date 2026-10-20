import { FastifyInstance } from 'fastify';
import { mockCommissions } from '../mock/data.js';

export async function commissionRoutes(fastify: FastifyInstance) {
    //  Liste des commissions
    fastify.get('/', { preHandler: [fastify.authenticate] }, async (_request, reply) => {
        return reply.send({
            success: true,
            message: 'Commissions récupérées',
            data: mockCommissions,
        });
    });

    //  Mettre à jour une commission
    fastify.put('/:userId', { preHandler: [fastify.authenticate] }, async (request, reply) => {
        const { userId } = request.params as { userId: string };
        const { rate } = request.body as { rate: number };

        const commission = mockCommissions.find((c) => c.userId === parseInt(userId));

        if (!commission) {
            return reply.status(404).send({
                success: false,
                error: 'Commission non trouvée',
            });
        }

        commission.rate = rate;

        return reply.send({
            success: true,
            message: `Commission mise à jour avec succès`,
            data: commission,
        });
    });
}