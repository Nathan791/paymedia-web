// packages/auth/src/index.ts
import bcrypt from 'bcryptjs';
import { SignJWT, jwtVerify, errors } from 'jose';
import type { FastifyRequest, FastifyReply } from 'fastify';

// ============================================================
// 1. TYPES
// ============================================================

export interface AccessTokenPayload {
    sub: string;
    userId: number;
    email: string;
    roles: string[];
}

export interface AuthOptions {
    jwtSecret: string;
}

export interface AuthUser {
    id: string;
    username: string;
    email: string;
    role: 'admin' | 'editor' | 'reader';
}

// ============================================================
// 2. MOTS DE PASSE
// ============================================================

export const hashPassword = (password: string): Promise<string> =>
    bcrypt.hash(password, 10);

export const comparePassword = (plain: string, hash: string): Promise<boolean> =>
    bcrypt.compare(plain, hash);

// ============================================================
// 3. JWT (jose)
// ============================================================

const encodeSecret = (secret: string) => new TextEncoder().encode(secret);

/** ttl : nombre de secondes (ex: 604800) ou durée jose (ex: '7d'). */
export async function signAccessToken(
    payload: AccessTokenPayload,
    secret: string,
    ttl: number | string
): Promise<string> {
    return new SignJWT({ ...payload })
        .setProtectedHeader({ alg: 'HS256' })
        .setSubject(payload.sub)
        .setIssuedAt()
        .setExpirationTime(typeof ttl === 'number' ? `${ttl}s` : ttl)
        .sign(encodeSecret(secret));
}

/** Retourne le payload, ou null si le token est invalide/expiré. */
export async function verifyAccessToken(
    token: string,
    secret: string
): Promise<AccessTokenPayload | null> {
    try {
        const { payload } = await jwtVerify(token, encodeSecret(secret));
        return payload as unknown as AccessTokenPayload;
    } catch {
        return null;
    }
}

/** Alias de compatibilité avec l'ancien code (jsonwebtoken). */
export const verifyToken = verifyAccessToken;

/** Génère un token avec un payload libre (par défaut 7 jours). */
export async function generateToken(
    payload: Record<string, unknown>,
    secret: string,
    expiresIn: number | string = '7d'
): Promise<string> {
    return new SignJWT(payload)
        .setProtectedHeader({ alg: 'HS256' })
        .setIssuedAt()
        .setExpirationTime(typeof expiresIn === 'number' ? `${expiresIn}s` : expiresIn)
        .sign(encodeSecret(secret));
}

// ============================================================
// 4. MIDDLEWARE FASTIFY
// ============================================================

export function buildAuthMiddleware({ jwtSecret }: AuthOptions) {
    const key = encodeSecret(jwtSecret);

    // Handler async : pas de callback `next` (Fastify refuse de mélanger les deux).
    return async function authMiddleware(request: FastifyRequest, reply: FastifyReply) {
        const authHeader = request.headers.authorization;

        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return reply.status(401).send({
                code: 'UNAUTHORIZED',
                message: 'Token manquant',
                timestamp: new Date().toISOString(),
            });
        }

        const token = authHeader.slice(7).trim();

        try {
            const { payload } = await jwtVerify(token, key);

            // Les tokens de signAccessToken ont `roles: string[]`,
            // les anciens tokens avaient `role: string`.
            const roles = Array.isArray(payload.roles) ? (payload.roles as string[]) : [];
            const role = (payload.role as string) ?? roles[0] ?? 'reader';

            (request as any).user = {
                id: String(payload.userId ?? payload.id ?? payload.sub),
                username: (payload.username as string) ?? (payload.name as string) ?? '',
                email: (payload.email as string) ?? '',
                role: role as AuthUser['role'],
            } satisfies AuthUser;
        } catch (error) {
            if (error instanceof errors.JWTExpired) {
                return reply.status(401).send({
                    code: 'UNAUTHORIZED',
                    message: 'Token expiré',
                    timestamp: new Date().toISOString(),
                });
            }
            if (error instanceof errors.JOSEError) {
                return reply.status(401).send({
                    code: 'UNAUTHORIZED',
                    message: 'Token invalide',
                    timestamp: new Date().toISOString(),
                });
            }
            return reply.status(500).send({
                code: 'AUTH_ERROR',
                message: "Erreur lors de l'authentification",
                timestamp: new Date().toISOString(),
            });
        }
    };
}

export default buildAuthMiddleware;