import { z } from 'zod';

export const UserRoleEnum = z.enum(['reader', 'editor', 'admin']);
export const OtpChannelEnum = z.enum(['sms', 'whatsapp', 'email']);

export const CreateUserSchema = z.object({
    username: z.string().max(100),
    email: z.string().email().max(150).optional(),
    phoneNumber: z.string().max(20).optional(),
    password: z.string().min(8),
    role: UserRoleEnum.default('reader'),
});

export const OtpValidationSchema = z.object({
    target: z.string().max(150),
    channel: OtpChannelEnum,
});

export const RegisterInputSchema = z.object({
    username: z.string().min(3, "Le nom d'utilisateur doit faire au moins 3 caractères").max(100),
    email: z.string().email("Format d'email invalide").max(150).optional(),
    phoneNumber: z.string().max(20).optional(),
    password: z.string().min(6, "Le mot de passe doit faire au moins 6 caractères"),
});

export const LoginInputSchema = z.object({
    // Permet de se connecter soit par email, soit par numéro de téléphone
    identifier: z.string().min(1, "L'email ou le téléphone est requis"),
    password: z.string().min(1, "Le mot de passe est requis"),
});

export type RegisterInput = z.infer<typeof RegisterInputSchema>;
export type LoginInput = z.infer<typeof LoginInputSchema>;



export const SendOtpSchema = z.object({
    userId: z.string().uuid("ID utilisateur invalide"),
    channel: z.enum(['sms', 'whatsapp', 'email']), // Aligné sur OtpChannel
});

export const VerifyOtpSchema = z.object({
    userId: z.string().uuid("ID utilisateur invalide"),
    code: z.string().length(6, "Le code doit contenir exactement 6 chiffres"),
});

export type SendOtpInput = z.infer<typeof SendOtpSchema>;
export type VerifyOtpInput = z.infer<typeof VerifyOtpSchema>;