import { FastifyRequest, FastifyReply } from 'fastify';
import { AdminAuthService } from '../services/auth.service';

const authService = new AdminAuthService();

export interface AuthRequest extends FastifyRequest {
    userData?: {
        id: number;
        email: string;
        role: string;
    };
}

export async function authenticate(
    this: any,
    request: FastifyRequest,
    reply: FastifyReply
) {
    try {
        const authHeader = request.headers.authorization;

        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return reply.status(401).send({
                success: false,
                error: 'Token non fourni'
            });
        }

        const token = authHeader.replace('Bearer ', '');
        const user = await authService.verifyToken(token);

        if (!user) {
            return reply.status(401).send({
                success: false,
                error: 'Token invalide ou expiré'
            });
        }

        (request as AuthRequest).userData = user;
    } catch (_error) {
        return reply.status(401).send({
            success: false,
            error: 'Token invalide ou expiré'
        });
    }
}

export async function requireAdmin(
    request: AuthRequest,
    reply: FastifyReply
) {
    if (!request.userData) {
        return reply.status(401).send({
            success: false,
            error: 'Non authentifié'
        });
    }

    if (request.userData.role !== 'admin') {
        return reply.status(403).send({
            success: false,
            error: 'Accès réservé aux administrateurs'
        });
    }
}