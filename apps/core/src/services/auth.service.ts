// apps/core/src/services/auth.service.ts
import { prisma } from '@paymedia/database'
import bcrypt from 'bcrypt'
import { ulid } from 'ulid'

export class AuthService {

    async registerUser(data: any) {
        const { username, email, password, countryCode, whatsappPhone } = data

        // 1. Vérification doublon
        const existingUser = await prisma.user.findUnique({ where: { email } })
        if (existingUser) {
            throw new Error('Cet email est déjà utilisé.')
        }

        // 2. Hachage du mot de passe
        const saltRounds = 10
        const passwordHash = await bcrypt.hash(password, saltRounds)

        // 3. Création de l'utilisateur et de son portefeuille associé (via nested write)
        const newUser = await prisma.user.create({
            data: {
                ulid: ulid(),
                username,
                email,
                passwordHash,
                countryCode,
                whatsappPhone,
                isVerified: true,
                wallet: {
                    create: {
                        ulid: ulid(),
                        balance: 0.00,
                        currency: 'XAF'
                    }
                }
            },
            select: { id: true, ulid: true, username: true, email: true }
        })

        return newUser
    }

    async loginUser(data: any) {
        const { email, password } = data

        const user = await prisma.user.findUnique({ where: { email } })
        if (!user || !user.passwordHash || !user.isActive || user.deletedAt) {
            throw new Error('Identifiants invalides ou compte inactif.')
        }

        const isPasswordValid = await bcrypt.compare(password, user.passwordHash)
        if (!isPasswordValid) {
            throw new Error('Identifiants invalides.')
        }

        const sessionJti = ulid()
        const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000)

        // Création de la session en base de données
        await prisma.session.create({
            data: {
                ulid: ulid(),
                userId: user.id,
                jti: sessionJti,
                tokenType: 'ACCESS',
                expiresAt
            }
        })

        // Mise à jour de la dernière connexion
        await prisma.user.update({
            where: { id: user.id },
            data: { lastLoginAt: new Date() }
        })

        return { user, sessionJti }
    }
}