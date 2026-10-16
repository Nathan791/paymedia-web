// packages/auth/src/password.ts
import bcrypt from 'bcrypt';

export async function hashPassword(password: string): Promise<string> {
    return bcrypt.hash(password, 12);
}

export async function comparePassword(password: string, hash: string): Promise<boolean> {
    return bcrypt.compare(password, hash);
}

//  FIX: Exportation de l'alias attendu par auth.service.ts
export const verifyPassword = comparePassword;