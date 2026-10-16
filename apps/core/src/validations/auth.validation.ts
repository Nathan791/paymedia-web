// src/validations/auth.validation.ts
import { z } from 'zod';
import { OtpChannel } from '@prisma/client';

export const RegisterSchema = z.object({
    username: z.string().min(3).max(100),
    email: z.string().email().max(150).optional(),
    phoneNumber: z.string().regex(/^\+?[1-9]\d{1,14}$/, "Format de téléphone international invalide").optional(),
    password: z.string().min(8, "Le mot de passe doit contenir au moins 8 caractères").max(255),
    countryCode: z.string().length(2).transform(val => val.toUpperCase()),
    otpChannel: z.nativeEnum(OtpChannel)
}).refine(data => data.email || data.phoneNumber, {
    message: "L'email ou le numéro de téléphone doit être fourni.",
    path: ["email"]
});

export const LoginSchema = z.object({
    identifier: z.string(), // Peut être l'email ou le téléphone
    password: z.string()
});

export const VerifyOtpSchema = z.object({
    target: z.string(), // email ou téléphone utilisé
    code: z.string().length(6, "Le code doit contenir exactement 6 chiffres")
});

export type RegisterInput = z.infer<typeof RegisterSchema>;
export type LoginInput = z.infer<typeof LoginSchema>;
export type VerifyOtpInput = z.infer<typeof VerifyOtpSchema>;