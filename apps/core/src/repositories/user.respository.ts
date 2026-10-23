// src/repositories/user.repository.ts
import { prisma } from '@paymedia/database';
import type { RegisterInput } from '@paymedia/schemas';
import { ulid } from 'ulid';

export class UserRepository {
    async findByEmailOrPhone(identifier: string) {
        return prisma.user.findFirst({
            where: {
                OR: [
                    { email: identifier },
                    { whatsappPhone: identifier },
                ],
                deletedAt: null,
            },
        });
    }

    async createUser(data: RegisterInput, passwordHash: string) {
        return prisma.user.create({
            data: {
                ulid: ulid(),
                username: data.username,
                email: data.email ?? null,
                whatsappPhone: data.phoneNumber ?? null,
                passwordHash,
                countryCode: data.countryCode,
                role: 'reader',
                isVerified: false,
            },
        });
    }

    async updateLastLogin(userId: number) {
        return prisma.user.update({
            where: { id: userId },
            data: { lastLoginAt: new Date() },
        });
    }
}