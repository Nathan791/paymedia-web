import jwt from 'jsonwebtoken'
import { FastifyRequest, FastifyReply } from 'fastify'

// ============================================================
// 1. INTERFACES
// ============================================================

export interface AuthOptions {
    jwtSecret: string
}

export interface AuthUser {
    id: string
    username: string
    email: string
    role: 'admin' | 'editor' | 'reader'
}

// ============================================================
// 2. FONCTION PRINCIPALE : buildAuthMiddleware
// ============================================================

export function buildAuthMiddleware(options: AuthOptions) {
    const { jwtSecret } = options

    /**
     * Middleware d'authentification Fastify
     * @param request - La requête Fastify
     * @param reply - La réponse Fastify
     * @param next - Fonction next pour continuer
     */
    return async function authMiddleware(
        request: FastifyRequest,
        reply: FastifyReply,
        next: (err?: any) => void
    ) {
        try {
            // 1. Récupérer le header Authorization
            const authHeader = request.headers.authorization

            if (!authHeader) {
                return reply.status(401).send({
                    code: 'UNAUTHORIZED',
                    message: 'Token manquant',
                    timestamp: new Date().toISOString()
                })
            }

            // 2. Extraire le token
            const token = authHeader.replace('Bearer ', '')

            // 3. Vérifier le token JWT
            const decoded = jwt.verify(token, jwtSecret) as any

                // 4. Ajouter l'utilisateur à la requête
            ;(request as any).user = {
                id: decoded.id || decoded.sub,
                username: decoded.username || decoded.name,
                email: decoded.email,
                role: decoded.role || 'reader'
            }

            // 5. Continuer
            next()
        } catch (error: any) {
            // Si le token est invalide
            if (error.name === 'JsonWebTokenError' || error.name === 'TokenExpiredError') {
                return reply.status(401).send({
                    code: 'UNAUTHORIZED',
                    message: error.name === 'TokenExpiredError'
                        ? 'Token expiré'
                        : 'Token invalide',
                    timestamp: new Date().toISOString()
                })
            }

            // Erreur inconnue
            return reply.status(500).send({
                code: 'AUTH_ERROR',
                message: 'Erreur lors de l\'authentification',
                timestamp: new Date().toISOString()
            })
        }
    }
}

// ============================================================
// 3. EXPORT PAR DÉFAUT
// ============================================================

export default buildAuthMiddleware

// ============================================================
// 4. EXPORT DES FONCTIONS UTILITAIRES
// ============================================================

// Fonction pour créer un token JWT
export function generateToken(payload: any, secret: string, expiresIn: string = '7d') {
    // @ts-ignore
    return jwt.sign(payload, secret, { expiresIn })
}

// Fonction pour vérifier un token
export function verifyToken(token: string, secret: string) {
    return jwt.verify(token, secret)
}

// Fonction pour hacher un mot de passe (simple)
export async function hashPassword(password: string): Promise<string> {
    const bcrypt = await import('bcryptjs')
    return bcrypt.hash(password, 10)
}

// Fonction pour comparer un mot de passe
export async function comparePassword(password: string, hash: string): Promise<boolean> {
    const bcrypt = await import('bcryptjs')
    return bcrypt.compare(password, hash)
}