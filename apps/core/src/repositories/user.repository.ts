// apps/core/src/repositories/user.repository.ts
import { PrismaClient, User, user_role } from '@paymedia/database';
import { ulid } from 'ulid';

export class UserRepository {
    constructor(private prisma: PrismaClient) {}

    /**
     * Trouver un utilisateur par son adresse email (inclut les comptes inactifs)
     */
    async findByEmail(email: string): Promise<User | null> {
        return this.prisma.user.findUnique({
            where: { email },
        });
    }

    /**
     * Trouver un utilisateur par son ID numérique (exclut les comptes supprimés)
     */
    async findById(id: number): Promise<User | null> {
        return this.prisma.user.findUnique({
            where: {
                id,
                deletedAt: null // Respecte le soft-delete
            },
        });
    }

    /**
     * 🚀 Création atomique d'un utilisateur ET de son portefeuille associé (Wallet)
     */
    async createUser(data: {
        ulid: string;
        username: string;
        email: string;
        passwordHash: string;
        countryCode: string;
        whatsappPhone?: string;
    }): Promise<User> {
        // Génération d'un ULID unique pour le portefeuille
        const walletUlid = ulid();

        return this.prisma.user.create({
            data: {
                ulid: data.ulid,
                username: data.username,
                email: data.email,
                passwordHash: data.passwordHash,
                countryCode: data.countryCode,
                whatsappPhone: data.whatsappPhone,
                role: user_role.reader, // Utilisation de l'enum Prisma pour un typage 100% sûr

                // 🚀 Magie de Prisma : création imbriquée du Wallet dans la même transaction BDD
                wallet: {
                    create: {
                        ulid: walletUlid,
                        balance: 0.00,
                        currency: 'XAF' // Devise locale par défaut
                    }
                }
            },
            // Optionnel : permet de charger directement la relation portefeuille si besoin au retour
            include: {
                wallet: true
            }
        });
    }
}