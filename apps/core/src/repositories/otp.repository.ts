import { prisma, OtpChannel } from '@paymedia/database'; // ✨ Import unifié et propre sans @ts-ignore

export class OtpRepository {
    /**
     * Enregistre un nouveau code OTP en base de données
     */
    async createOtp(userId: string, target: string, code: string, channel: OtpChannel, expiresAt: Date) {
        return prisma.otpValidation.create({
            data: {
                userId,
                target,
                code,
                channel,
                expiresAt,
                isUsed: false
            }
        });
    }

    /**
     * Recherche un code OTP valide et non utilisé pour un utilisateur donné
     */
    async findActiveOtp(userId: string, code: string) {
        return prisma.otpValidation.findFirst({
            where: {
                userId,
                code,
                isUsed: false,
                expiresAt: { gt: new Date() } // Non expiré
            },
            orderBy: { createdAt: 'desc' } // Le plus récent
        });
    }

    /**
     * Marque un jeton OTP comme utilisé pour éviter qu'il soit réutilisé
     */
    async markAsUsed(otpId: string) {
        return prisma.otpValidation.update({
            where: { id: otpId },
            data: { isUsed: true }
        });
    }

    /**
     * Valide le compte de l'utilisateur final une fois l'OTP confirmé
     */
    async verifyUser(userId: string) {
        return prisma.user.update({
            where: { id: userId },
            data: { isVerified: true }
        });
    }

    /**
     * ✨ Correction de findVAlidOtp : Recherche le tout dernier OTP généré pour un utilisateur
     * (Pratique pour vérifier s'il existe déjà un code actif avant d'en renvoyer un nouveau)
     */
    async findValidOtp(userId: string, code: string) {
        return prisma.otpValidation.findFirst({
            where: {
                userId,
                isUsed: false,
                expiresAt: { gt: new Date() }
            },
            orderBy: { createdAt: 'desc' }
        });
    }
}