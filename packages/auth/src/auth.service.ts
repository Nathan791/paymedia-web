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

export interface AuthUserResponse {
    id: number
    ulid: string
    username: string | null // 👈 Autorise explicitement le type null
    email: string
    role: string | null     // 👈 Autorise explicitement le type null
}

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

    // Cast explicite pour couper court à toute erreur de type null
    const userRole = (user.role ?? 'reader') as string

    const accessToken = await signAccessToken(
        {
            sub: user.ulid,
            userId: targetId,
            jti: accessJti,
            email: (user.email ?? '') as string,
            roles: [userRole]
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
            ulid: user.ulid ?? '',
            username: (user.username ?? null) as string | null,
            email: (user.email ?? '') as string,
            role: userRole
        }
    }
}

// --- Déclaration du Plugin Fastify ---
const authServicePlugin = async (fastify: any, options: AuthServiceConfig) => {
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

    fastify.decorate('authService', authService)
}

// Exportation sécurisée via fastify-plugin
export default fp(authServicePlugin, {
    name: '@paymedia/auth-service',
}) as any

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