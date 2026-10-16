import { OtpRepository } from '../repositories/otp.repository';
import { OtpClient } from './otp.client';
import { OtpChannel } from "@paymedia/database";

const config = {
    apiKey: process.env.OTP_PROVIDER_API_KEY || 'mock-key',
};

export class OtpService {
    private otpRepository = new OtpRepository();
    private otpClient = new OtpClient(config);

    /**
     * 🚀 Génère, stocke et ordonne l'envoi d'un code OTP
     */
    async requestOtp(target: string, channel: OtpChannel, userId: string): Promise<void> {
        const code = Math.floor(100000 + Math.random() * 900000).toString();

        const expiresAt = new Date();
        expiresAt.setMinutes(expiresAt.getMinutes() + 5);

        // 1. Sauvegarde en Base de Données via le Repository
        await this.otpRepository.createOtp(userId, target, code, channel, expiresAt);

        // 2. ✨ CORRECTION : Appel réel et propre du client externe (1 seul argument objet)
        await this.otpClient.dispatch({ target, code, channel });
    }

    /**
     * 🔍 Vérifie et consomme un code OTP
     */
    async verifyOtp(userId: string, code: string): Promise<boolean> {
        const otp = await this.otpRepository.findActiveOtp(userId, code);

        if (!otp) {
            return false;
        }

        // Consommer le code (anti-rejeu)
        await this.otpRepository.markAsUsed(otp.id);

        // Activer le compte de l'utilisateur final
        await this.otpRepository.verifyUser(userId);

        return true;
    }
}

export default OtpService;