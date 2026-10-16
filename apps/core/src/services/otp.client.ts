import { OtpChannel } from "@paymedia/database";

/**
 * ✨ Contrat d'interface pour l'envoi d'un OTP.
 * Contient explicitement la propriété 'target' demandée par TypeScript.
 */
export interface SendOtpPayload {
    target: string;
    code: string;
    channel: OtpChannel;
}

export class OtpClient {
    private apiKey: string;

    /**
     * Le constructeur accepte l'objet de configuration (ex: clé d'API de votre fournisseur)
     */
    constructor(config: { apiKey: string }) {
        this.apiKey = config.apiKey;
    }

    /**
     * 🚀 Envoie le code de vérification via le bon canal (Email ou SMS)
     * ✨ Reçoit un UNIQUE argument de type SendOtpPayload déstructuré en interne.
     */
    async dispatch({ target, code, channel }: SendOtpPayload): Promise<void> {

        // Sécurité ou validation optionnelle
        if (!target) {
            throw new Error("[OtpClient] Impossible d'envoyer l'OTP : la cible (target) est manquante.");
        }

        if (channel === OtpChannel.email) {
            // Logique de production pour l'envoi d'un email (ex: Resend, Brevo, Nodemailer)
            console.log(`[📧 EMAIL CLIENT] Envoi du code ${code} à l'adresse email : ${target}`);
            // Exemple : await this.sendEmailViaProvider(target, code);
        } else {
            // Logique de production pour l'envoi d'un SMS (ex: Twilio, Infobip)
            console.log(`[📱 SMS CLIENT] Envoi du code ${code} au numéro de téléphone : ${target}`);
            // Exemple : await this.sendSmsViaProvider(target, code);
        }
    }

    /*
    private async sendEmailViaProvider(email: string, code: string) {
        // Votre intégration avec l'API tierce (ex: Resend, Sendgrid)
    }

    private async sendSmsViaProvider(phone: string, code: string) {
        // Votre intégration avec l'API tierce (ex: Twilio)
    }
    */
}

export default OtpClient;