import type { FastifyInstance } from 'fastify'
import fp from 'fastify-plugin'
import { prisma } from '@paymedia/database'
import type { Prisma } from '@paymedia/database'
import {
    signAccessToken,
    signRefreshToken,
    verifyRefreshToken,
} from './jwt'
import { verifyPassword } from './password'
import {
    createSession,
    findRefreshSession,
    revokeAllUserSessions,
} from './session'

// --- Interfaces & Types ---
export interface AuthServiceConfig {
    jwtSecret:        string
    jwtRefreshSecret: string
    accessTtl:        number
    refreshTtl:       number
}



// 1. Ajoutez une interface pour représenter l'utilisateur minimal retourné par le jeton
export interface AuthUserResponse {
    id: number
    ulid: string
    username: string
    email: string
    role: string
}

// 2. Enrichissez TokenPair pour y inclure l'utilisateur
export interface TokenPair {
    accessToken:  string
    refreshToken: string
    expiresIn:    number
    user:         AuthUserResponse
}

type UserWithRoles = Prisma.UserGetPayload<{}>

// --- Fonctions internes utilitaires ---
async function buildTokenPair(user: UserWithRoles, cfg: AuthServiceConfig): Promise<TokenPair> {
    const targetId = typeof user.id === 'string' ? Number(user.id) : user.id

    const { jti: accessJti }  = await createSession(targetId, 'ACCESS',  cfg.accessTtl)
    const { jti: refreshJti } = await createSession(targetId, 'REFRESH', cfg.refreshTtl)

    const accessToken = await signAccessToken(
        {
            sub: user.ulid,
            userId: targetId,
            jti: accessJti,
            email: user.email ?? '',
            roles: [user.role]
        },
        cfg.jwtSecret,
        cfg.accessTtl,
    )
    const refreshToken = await signRefreshToken(
        { sub: user.ulid, jti: refreshJti, type: 'refresh' },
        cfg.jwtRefreshSecret,
        cfg.refreshTtl,
    )

    return {
        accessToken,
        refreshToken,
        expiresIn: cfg.accessTtl,
        user: {
            id: targetId,
            ulid: user.ulid,
            username: user.username,
            email: user.email ?? '',
            role: user.role
        }
    }
}

// --- Déclaration du Plugin Fastify ---
async function authServicePlugin(fastify: FastifyInstance, options: AuthServiceConfig) {

    // Regroupement des méthodes du service d'authentification
    const authService = {
        async loginUser(email: string, password: string): Promise<TokenPair | { error: 'invalid_credentials' | 'account_disabled' }> {
            const user = await prisma.user.findFirst({
                where: { email, deletedAt: null },
            })

            if (!user || !user.passwordHash) return { error: 'invalid_credentials' }
            if (!(await verifyPassword(password, user.passwordHash))) return { error: 'invalid_credentials' }
            if (!user.isVerified) return { error: 'invalid_credentials' }

            const targetId = typeof user.id === 'string' ? Number(user.id) : user.id
            await revokeAllUserSessions(targetId)
            return buildTokenPair(user, options)
        },

        async refreshUser(refreshToken: string): Promise<TokenPair | { error: 'invalid_token' }> {
            let sub: string
            let jti: string
            try {
                const payload = await verifyRefreshToken(refreshToken, options.jwtRefreshSecret)
                sub = payload.sub!
                jti = payload.jti!
            } catch {
                return { error: 'invalid_token' }
            }

            const session = await findRefreshSession(jti)
            if (!session) return { error: 'invalid_token' }

            const user = await prisma.user.findFirst({
                where: { ulid: sub, deletedAt: null },
            })
            if (!user) return { error: 'invalid_token' }

            const targetId = typeof user.id === 'string' ? Number(user.id) : user.id
            await revokeAllUserSessions(targetId)
            return buildTokenPair(user, options)
        },

        async logoutUser(userId: string | number): Promise<void> {
            const targetId = typeof userId === 'string' ? Number(userId) : userId
            await revokeAllUserSessions(targetId)
        }
    }

    // Décoration de l'instance Fastify globale pour rendre le service disponible partout
    fastify.decorate('authService', authService)
}

// Exportation via fastify-plugin pour casser l'encapsulation de Fastify
export default fp(authServicePlugin, {
    name: '@paymedia/auth-service',
    fastify: '5.x'
})

// --- Augmentation des Types TypeScript pour Fastify ---
declare module 'fastify' {
    interface FastifyInstance {
        authService: {
            loginUser(email: string, password: string): Promise<TokenPair | { error: 'invalid_credentials' | 'account_disabled' }>
            refreshUser(refreshToken: string): Promise<TokenPair | { error: 'invalid_token' }>
            logoutUser(userId: string | number): Promise<void>
        }
    }
}