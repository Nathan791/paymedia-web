import { prisma } from '@paymedia/database';
import { createLogger } from '@paymedia/logger';
import type { AdminUser } from '../types/index.js';
// Utilisation propre et standardisée du package partagé du monorepo
import { comparePassword, signAccessToken, verifyAccessToken } from '@paymedia/auth';

const logger = createLogger('admin-auth');

export class AdminAuthService {
    async getAdminUser(userId: number): Promise<AdminUser | null> {
        try {
            const user = await prisma.user.findUnique({
                where: { id: userId },
                include: { wallet: true }
            });

            if (!user || user.role !== 'admin' || !user.isActive) {
                return null;
            }

            return user as unknown as AdminUser;
        } catch (error) {
            const err = error as Error;
            logger.error('Erreur récupération admin: %s', err.message);
            return null;
        }
    }

    async adminLogin(email: string, password: string): Promise<{
        token: string;
        user: AdminUser;
    }> {
        try {
            const user = await prisma.user.findUnique({
                where: { email },
                include: { wallet: true }
            });

            if (!user) {
                throw new Error('Email ou mot de passe incorrect');
            }

            const passwordValid = await comparePassword(
                password,
                user.passwordHash || ''
            );

            if (!passwordValid) {
                throw new Error('Email ou mot de passe incorrect');
            }

            if (user.role !== 'admin') {
                throw new Error('Accès non autorisé : administrateur requis');
            }

            if (!user.isActive) {
                throw new Error('Compte désactivé');
            }

            // Calcul explicite du TTL (7 jours en secondes)
            const sevenDaysInSeconds = 7 * 24 * 60 * 60;

            const token = await signAccessToken(
                {
                    sub: user.ulid,
                    userId: Number(user.id),
                    email: user.email || '',
                    roles: [user.role]
                },
                process.env.JWT_SECRET || 'secret',
                sevenDaysInSeconds
            );

            await prisma.user.update({
                where: { id: user.id },
                data: { lastLoginAt: new Date() }
            });

            logger.info('Admin connecté: %s', user.email);

            return { token, user: user as unknown as AdminUser };
        } catch (error) {
            const err = error as Error;
            logger.error('Erreur login admin: %s', err.message);
            throw error;
        }
    }

    async verifyToken(token: string): Promise<{ id: number; email: string; role: string } | null> {
        try {
            const decoded = await verifyAccessToken(token, process.env.JWT_SECRET!);

            if (!decoded || !decoded.userId) {
                return null;
            }

            const user = await prisma.user.findUnique({
                where: { id: decoded.userId }
            });

            if (!user || user.role !== 'admin' || !user.isActive) {
                return null;
            }

            return {
                id: Number(user.id),
                email: user.email || '',
                role: user.role
            };
        } catch (error) {
            const err = error as Error;
            logger.error('Erreur vérification token: %s', err.message);
            return null;
        }
    }
}