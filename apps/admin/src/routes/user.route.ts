import { FastifyInstance } from 'fastify';
import { mockUsers } from '../mock/data';

export async function userRoutes(fastify: FastifyInstance) {
    // Liste des utilisateurs
    fastify.get('/', { preHandler: [fastify.authenticate] }, async (request, reply) => {
        const { search = '', status = 'all', role = 'all' } = request.query as any;

        let filtered = [...mockUsers];

        // Filtre par recherche
        if (search) {
            const s = search.toLowerCase();
            filtered = filtered.filter(
                (u) =>
                    u.username.toLowerCase().includes(s) ||
                    u.email.toLowerCase().includes(s)
            );
        }

        // Filtre par statut
        if (status === 'active') {
            filtered = filtered.filter((u) => u.isActive);
        } else if (status === 'inactive') {
            filtered = filtered.filter((u) => !u.isActive);
        }

        // Filtre par rôle
        if (role !== 'all') {
            filtered = filtered.filter((u) => u.role === role);
        }

        return reply.send({
            success: true,
            message: 'Utilisateurs récupérés',
            data: {
                users: filtered,
                total: filtered.length,
            },
        });
    });

    //  Détails d'un utilisateur
    fastify.get('/:id', { preHandler: [fastify.authenticate] }, async (request, reply) => {
        const { id } = request.params as { id: string };
        const user = mockUsers.find((u) => u.id === parseInt(id));

        if (!user) {
            return reply.status(404).send({
                success: false,
                error: 'Utilisateur non trouvé',
            });
        }

        return reply.send({
            success: true,
            message: 'Utilisateur récupéré',
            data: user,
        });
    });

    // Bloquer un utilisateur
    fastify.post('/:id/block', { preHandler: [fastify.authenticate] }, async (request, reply) => {
        const { id } = request.params as { id: string };
        const user = mockUsers.find((u) => u.id === parseInt(id));

        if (!user) {
            return reply.status(404).send({
                success: false,
                error: 'Utilisateur non trouvé',
            });
        }

        user.isActive = false;

        return reply.send({
            success: true,
            message: `Utilisateur ${user.username} bloqué avec succès`,
            data: user,
        });
    });

    //  Débloquer un utilisateur
    fastify.post('/:id/unblock', { preHandler: [fastify.authenticate] }, async (request, reply) => {
        const { id } = request.params as { id: string };
        const user = mockUsers.find((u) => u.id === parseInt(id));

        if (!user) {
            return reply.status(404).send({
                success: false,
                error: 'Utilisateur non trouvé',
            });
        }

        user.isActive = true;

        return reply.send({
            success: true,
            message: `Utilisateur ${user.username} débloqué avec succès`,
            data: user,
        });
    });
}