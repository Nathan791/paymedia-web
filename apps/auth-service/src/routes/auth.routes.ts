// apps/auth-service/src/routes/auth.routes.ts
import { FastifyInstance } from 'fastify';
import { authService } from '../services/auth.service';
import { originMiddleware } from '../middlewares/origin.middleware';

export async function authRoutes(fastify: FastifyInstance) {

    // ============================================================
    // LOGIN
    // ============================================================
    fastify.post('/api/auth/login', { preHandler: originMiddleware }, async (request, reply) => {
        try {
            const origin = (request as any).appOrigin;
            const { email, password } = request.body as { email: string; password: string };

            if (!email || !password) {
                return reply.status(400).send({
                    success: false,
                    error: 'Email et mot de passe requis'
                });
            }

            const result = await authService.login(origin, email, password);

            // ⭐ RETOURNER LA RÉPONSE COMPLÈTE
            return reply.send(result.data);

        } catch (error: any) {
            console.error('Login error:', error.response?.data || error.message);
            const status = error.response?.status || 500;
            const data = error.response?.data || {
                success: false,
                error: 'Erreur interne du serveur'
            };
            return reply.status(status).send(data);
        }
    });

    // ============================================================
    // REGISTER
    // ============================================================
    fastify.post('/api/auth/register', { preHandler: originMiddleware }, async (request, reply) => {
        try {
            const origin = (request as any).appOrigin;
            const body = request.body as any;

            if (!body.email || !body.password || !body.username) {
                return reply.status(400).send({
                    success: false,
                    error: 'Email, mot de passe et nom d\'utilisateur requis'
                });
            }

            const data = await authService.register(origin, body);
            return reply.send(data);
        } catch (error: any) {
            console.error('Register error:', error.response?.data || error.message);
            const status = error.response?.status || 500;
            const data = error.response?.data || {
                success: false,
                error: 'Erreur interne du serveur'
            };
            return reply.status(status).send(data);
        }
    });

    // ============================================================
    // LOGOUT
    // ============================================================
    fastify.post('/api/auth/logout', { preHandler: originMiddleware }, async (request, reply) => {
        try {
            const origin = (request as any).appOrigin;
            const token = request.headers.authorization?.replace('Bearer ', '');

            if (!token) {
                return reply.status(401).send({
                    success: false,
                    error: 'Token manquant'
                });
            }

            await authService.logout(origin, token);
            return reply.send({ success: true });
        } catch (error: any) {
            const status = error.response?.status || 500;
            const data = error.response?.data || {
                success: false,
                error: 'Erreur interne du serveur'
            };
            return reply.status(status).send(data);
        }
    });

    // ============================================================
    // GET PROFILE
    // ============================================================
    fastify.get('/api/auth/me', { preHandler: originMiddleware }, async (request, reply) => {
        try {
            const origin = (request as any).appOrigin;
            const token = request.headers.authorization?.replace('Bearer ', '');

            if (!token) {
                return reply.status(401).send({
                    success: false,
                    error: 'Token manquant'
                });
            }

            const data = await authService.getProfile(origin, token);
            return reply.send(data);
        } catch (error: any) {
            const status = error.response?.status || 500;
            const data = error.response?.data || {
                success: false,
                error: 'Erreur interne du serveur'
            };
            return reply.status(status).send(data);
        }
    });
}