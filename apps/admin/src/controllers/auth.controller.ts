import { FastifyRequest, FastifyReply } from 'fastify';
import { AdminAuthService } from '../services/auth.service.js';
import { AuthRequest } from '../middlewares/auth.middleware.js';

const authService = new AdminAuthService();

export class AuthController {
    async login(request: FastifyRequest, reply: FastifyReply) {
        try {
            const { email, password } = request.body as { email: string; password: string };

            if (!email || !password) {
                return reply.status(400).send({
                    success: false,
                    error: 'Email et mot de passe requis'
                });
            }

            const result = await authService.adminLogin(email, password);

            return reply.send({
                success: true,
                message: 'Connexion réussie',
                data: result
            });
        } catch (error) {
            const err = error as Error;

            if (err.message === 'Email ou mot de passe incorrect') {
                return reply.status(401).send({
                    success: false,
                    error: err.message
                });
            }

            if (err.message === 'Accès non autorisé : administrateur requis') {
                return reply.status(403).send({
                    success: false,
                    error: err.message
                });
            }

            if (err.message === 'Compte désactivé') {
                return reply.status(403).send({
                    success: false,
                    error: err.message
                });
            }

            return reply.status(500).send({
                success: false,
                error: 'Erreur lors de la connexion'
            });
        }
    }

    async me(request: FastifyRequest, reply: FastifyReply) {
        try {
            const user = (request as AuthRequest).userData;

            if (!user) {
                return reply.status(401).send({
                    success: false,
                    error: 'Non authentifié'
                });
            }

            const adminUser = await authService.getAdminUser(user.id);

            if (!adminUser) {
                return reply.status(404).send({
                    success: false,
                    error: 'Utilisateur non trouvé'
                });
            }

            return reply.send({
                success: true,
                message: 'Profil récupéré',
                data: adminUser
            });
        } catch (error) {
            return reply.status(500).send({
                success: false,
                error: 'Erreur lors de la récupération du profil'
            });
        }
    }

    async logout(_request: FastifyRequest, reply: FastifyReply) {
        return reply.send({
            success: true,
            message: 'Déconnexion réussie',
            data: null
        });
    }
}