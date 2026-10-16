import { prisma } from '@paymedia/database';
import { createLogger } from '@paymedia/logger';
import { AdminUser } from '../types';

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

            return user as AdminUser;
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
            const authModule = await import('@paymedia/auth');

            const user = await prisma.user.findUnique({
                where: { email },
                include: { wallet: true }
            });

            if (!user) {
                throw new Error('Email ou mot de passe incorrect');
            }

            const passwordValid = await authModule.comparePassword(
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

            const token = authModule.generateToken(
                { id: user.id, email: user.email, role: user.role },
                process.env.JWT_SECRET || 'secret',
                process.env.JWT_EXPIRES_IN || '7d'
            );

            await prisma.user.update({
                where: { id: user.id },
                data: { lastLoginAt: new Date() }
            });

            logger.info(' Admin connecté: %s', user.email);

            return { token, user: user as AdminUser };
        } catch (error) {
            const err = error as Error;
            logger.error('Erreur login admin: %s', err.message);
            throw error;
        }
    }

    async verifyToken(token: string): Promise<{ id: number; email: string; role: string } | null> {
        try {
            const authModule = await import('@paymedia/auth');
            const decoded = await authModule.verifyToken(token,process.env.JWT_SECRET!);

            if (!decoded || typeof decoded === 'string') {
                return null;
            }

            const user = await prisma.user.findUnique({
                where: { id: decoded.id }
            });

            if (!user || user.role !== 'admin' || !user.isActive) {
                return null;
            }

            return {
                id: user.id,
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