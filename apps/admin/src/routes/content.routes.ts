import { FastifyInstance } from 'fastify';
import { mockContents } from '../mock/data';

export async function contentRoutes(fastify: FastifyInstance) {
    // Liste des contenus
    fastify.get('/', { preHandler: [fastify.authenticate] }, async (request, reply) => {
        const { status = 'all', search = '' } = request.query as any;

        let filtered = [...mockContents];

        if (status !== 'all') {
            filtered = filtered.filter((c) => c.status === status);
        }

        if (search) {
            const s = search.toLowerCase();
            filtered = filtered.filter(
                (c) =>
                    c.title.toLowerCase().includes(s) ||
                    c.author.toLowerCase().includes(s)
            );
        }

        return reply.send({
            success: true,
            message: 'Contenus récupérés',
            data: {
                contents: filtered,
                total: filtered.length,
            },
        });
    });

    // Détails d'un contenu
    fastify.get('/:id', { preHandler: [fastify.authenticate] }, async (request, reply) => {
        const { id } = request.params as { id: string };
        const content = mockContents.find((c) => c.id === parseInt(id));

        if (!content) {
            return reply.status(404).send({
                success: false,
                error: 'Contenu non trouvé',
            });
        }

        return reply.send({
            success: true,
            message: 'Contenu récupéré',
            data: content,
        });
    });

    //  Approuver un contenu
    fastify.post('/:id/approve', { preHandler: [fastify.authenticate] }, async (request, reply) => {
        const { id } = request.params as { id: string };
        const content = mockContents.find((c) => c.id === parseInt(id));

        if (!content) {
            return reply.status(404).send({
                success: false,
                error: 'Contenu non trouvé',
            });
        }

        content.status = 'published';

        return reply.send({
            success: true,
            message: `Contenu "${content.title}" approuvé avec succès`,
            data: content,
        });
    });

    // Bloquer un contenu
    fastify.post('/:id/block', { preHandler: [fastify.authenticate] }, async (request, reply) => {
        const { id } = request.params as { id: string };
        const content = mockContents.find((c) => c.id === parseInt(id));

        if (!content) {
            return reply.status(404).send({
                success: false,
                error: 'Contenu non trouvé',
            });
        }

        content.status = 'blocked';

        return reply.send({
            success: true,
            message: `Contenu "${content.title}" bloqué avec succès`,
            data: content,
        });
    });

    //  Archiver un contenu
    fastify.post('/:id/archive', { preHandler: [fastify.authenticate] }, async (request, reply) => {
        const { id } = request.params as { id: string };
        const content = mockContents.find((c) => c.id === parseInt(id));

        if (!content) {
            return reply.status(404).send({
                success: false,
                error: 'Contenu non trouvé',
            });
        }

        content.status = 'archived';

        return reply.send({
            success: true,
            message: `Contenu "${content.title}" archivé avec succès`,
            data: content,
        });
    });
}