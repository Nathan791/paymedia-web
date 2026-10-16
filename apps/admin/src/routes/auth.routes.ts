import { FastifyInstance } from 'fastify';

export async function authRoutes(fastify: FastifyInstance) {
    //  Login mock
    fastify.post('/login', async (request, reply) => {
        const { email, password } = request.body as { email: string; password: string };

        // Admin test
        if (email === 'admin@paymedia.com' && password === 'Admin123!') {
            return reply.send({
                success: true,
                message: 'Connexion réussie',
                data: {
                    token: 'mock-jwt-token-for-testing',
                    user: {
                        id: 1,
                        username: 'SuperAdmin',
                        email: 'admin@paymedia.com',
                        role: 'admin',
                        isActive: true,
                        createdAt: '2026-01-01T00:00:00.000Z',
                    },
                },
            });
        }

        // Autres utilisateurs (pour test)
        const { mockUsers } = await import('../mock/data');
        const user = mockUsers.find((u: any) => u.email === email);

        if (user && password === 'password123') {
            return reply.send({
                success: true,
                message: 'Connexion réussie',
                data: {
                    token: 'mock-jwt-token-for-testing',
                    user,
                },
            });
        }

        return reply.status(401).send({
            success: false,
            error: 'Email ou mot de passe incorrect',
        });
    });

    //  Profil
    fastify.get('/me', { preHandler: [fastify.authenticate] }, async (request, reply) => {
        const user = (request as any).userData || {
            id: 1,
            username: 'SuperAdmin',
            email: 'admin@paymedia.com',
            role: 'admin',
        };

        return reply.send({
            success: true,
            message: 'Profil récupéré',
            data: user,
        });
    });

    // Logout
    fastify.post('/logout', { preHandler: [fastify.authenticate] }, async (_request, reply) => {
        return reply.send({
            success: true,
            message: 'Déconnexion réussie',
            data: null,
        });
    });
}