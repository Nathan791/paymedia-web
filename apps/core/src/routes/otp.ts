// src/routes/otp.routes.ts
import { FastifyInstance } from 'fastify';
import { sendOtpHandler, verifyOtpHandler } from '../controllers/otp.controller';

export async function otpRoutes(fastify: FastifyInstance) {

    /**
     * 🟢 Route publique : Demande et renvoi de code d'activation
     * Utilisé pour le premier envoi ou en cas de demande de renvoi (Resend)
     */
    fastify.post('/otp/send', sendOtpHandler);

    /**
     * 🟢 Route publique : Validation de l'OTP
     * Doit rester accessible sans token car l'utilisateur valide son compte
     * AVANT sa première connexion globale.
     */
    fastify.post('/otp/verify', verifyOtpHandler);
}