// packages/auth/src/session.ts
import { prisma } from '@paymedia/database';
import { ulid } from 'ulidx';

/**
 * Crée une session en base de données pour un utilisateur.
 * Note : userId est bien de type 'number' (Int)
 */
export async function createSession(userId: number, tokenType: 'ACCESS' | 'REFRESH', ttlSeconds: number) {
    const sessionUlid = ulid();
    const jti = ulid();
    const expiresAt = new Date(Date.now() + ttlSeconds * 1000);

    const session = await prisma.session.create({
        data: {
            ulid: sessionUlid,
            userId,
            jti,
            tokenType,
            expiresAt,
        },
    });

    return session;
}

/**
 * Recherche une session de type REFRESH valide par son identifiant unique (jti)
 */
export async function findRefreshSession(jti: string) {
    const session = await prisma.session.findUnique({
        where: { jti },
    });

    if (!session) return null;
    if (session.tokenType !== 'REFRESH') return null;
    if (session.revokedAt) return null;
    if (session.expiresAt < new Date()) return null;

    return session;
}

/**
 * Révoque toutes les sessions actives (ACCESS et REFRESH) d'un utilisateur (ex: lors du logout)
 */
export async function revokeAllUserSessions(userId: number): Promise<void> {
    await prisma.session.updateMany({
        where: {
            userId,
            revokedAt: null,
        },
        data: {
            revokedAt: new Date(),
        },
    });
}

/**
 * Vérifie si une session spécifique est valide
 */
export async function isSessionValid(jti: string): Promise<boolean> {
    const session = await prisma.session.findUnique({
        where: { jti },
    });
    if (!session) return false;
    if (session.revokedAt) return false;
    if (session.expiresAt < new Date()) return false;
    return true;
}