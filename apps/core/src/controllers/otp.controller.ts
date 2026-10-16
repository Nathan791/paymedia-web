import { FastifyRequest, FastifyReply } from 'fastify';
import { prisma, OtpChannel } from '@paymedia/database';
import { OtpRepository } from '../repositories/otp.repository';
import { OtpClient } from '../services/otp.client';
import { SendOtpInput, VerifyOtpInput } from '@paymedia/schemas';

const otpRepository = new OtpRepository();
const config = { apiKey: process.env.OTP_PROVIDER_API_KEY || 'mock-key' };
const otpClient = new OtpClient(config);

/**
 * 🚀 Handler : Demande et envoi d'un OTP
 */
export async function sendOtpHandler(
    request: FastifyRequest<{ Body: SendOtpInput }>,
    reply: FastifyReply
) {
    const { userId, channel } = request.body;

    // 1. Récupérer l'utilisateur
    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user || !user.isActive) {
        return reply.status(404).send({ error: "Utilisateur introuvable ou inactif." });
    }

    // ✨ ALIGNEMENT SCHEMA : Conversion en minuscules pour correspondre à l'enum du nouveau schéma
    const dbChannel = channel.toLowerCase() as OtpChannel;

    // Extraction de la cible dynamique
    const target = dbChannel === OtpChannel.email ? user.email : user.phoneNumber;
    if (!target) {
        return reply.status(400).send({
            error: `L'utilisateur ne possède pas de coordonnées configurées pour le canal : ${channel}`
        });
    }

    // 2. Génération des métadonnées
    const generatedCode = Math.floor(100000 + Math.random() * 900000).toString();
    const expiresAt = new Date();
    expiresAt.setMinutes(expiresAt.getMinutes() + 10); // Expire dans 10 minutes

    // 3. Sauvegarde via le Repository (qui écrit dans la table pm_otp_validations)
    await otpRepository.createOtp(user.id, target, generatedCode, dbChannel, expiresAt);

    // 4. Expédition via le Client externe (1 seul argument sous forme d'objet)
    await otpClient.dispatch({
        target,
        code: generatedCode,
        channel: dbChannel
    });

    return reply.send({ message: `Code de vérification envoyé avec succès via ${channel}.` });
}

/**
 * 🔍 Handler : Vérification de l'OTP
 */
export async function verifyOtpHandler(
    request: FastifyRequest<{ Body: VerifyOtpInput }>,
    reply: FastifyReply
) {
    const { userId, code } = request.body;

    // 1. Récupération de l'OTP actif
    const activeOtp = await otpRepository.findActiveOtp(userId, code);
    if (!activeOtp) {
        return reply.status(400).send({ error: "Code OTP invalide ou expiré." });
    }

    // 2. Consommation immédiate (Anti-rejeu)
    await otpRepository.markAsUsed(activeOtp.id);

    // 3. Activation/Validation du compte de l'utilisateur
    await prisma.user.update({
        where: { id: userId },
        data: { isVerified: true }
    });

    return reply.send({ message: "Votre compte et vos coordonnées ont été validés avec succès." });
}