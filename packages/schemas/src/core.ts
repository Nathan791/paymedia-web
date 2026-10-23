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

// ─── INSCRIPTION (une seule définition) ──────────────────────────────────────
export const RegisterInputSchema = z
    .object({
        username: z
            .string()
            .min(3, "Le nom d'utilisateur doit faire au moins 3 caractères")
            .max(100),
        email: z.string().email("Format d'email invalide").max(150).optional(),
        phoneNumber: z.string().max(20).optional(),
        password: z
            .string()
            .min(6, 'Le mot de passe doit faire au moins 6 caractères'),
        countryCode: z
            .string()
            .length(2, 'Le code pays doit faire 2 caractères')
            .transform((v) => v.toUpperCase()),
    })
    .refine((d) => d.email || d.phoneNumber, {
        message: 'Email ou numéro de téléphone requis',
        path: ['email'],
    });

// Alias conservé pour ne casser aucun import existant
export const RegisterSchema = RegisterInputSchema;

export const LoginInputSchema = z.object({
    // Permet de se connecter soit par email, soit par numéro de téléphone
    identifier: z.string().min(1, "L'email ou le téléphone est requis"),
    password: z.string().min(1, 'Le mot de passe est requis'),
});

export type RegisterInput = z.infer<typeof RegisterInputSchema>;
export type LoginInput = z.infer<typeof LoginInputSchema>;

// ─── OTP ─────────────────────────────────────────────────────────────────────
export const SendOtpSchema = z.object({
    userId: z.string().uuid('ID utilisateur invalide'),
    channel: OtpChannelEnum,
});

export const VerifyOtpSchema = z.object({
    userId: z.string().uuid('ID utilisateur invalide'),
    code: z.string().length(6, 'Le code doit contenir exactement 6 chiffres'),
});

export type SendOtpInput = z.infer<typeof SendOtpSchema>;
export type VerifyOtpInput = z.infer<typeof VerifyOtpSchema>;