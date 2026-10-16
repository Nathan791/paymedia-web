// src/repositories/_utils.ts
//
// Utilitaires partagés par tous les repositories mock. L'objectif : simuler
// une vraie latence réseau (300-700ms) pour que les états de chargement de
// l'UI soient testés dès maintenant, et ne pas se retrouver avec un
// "ça marchait en mock mais l'UI n'a jamais géré le loading" une fois
// branché sur la vraie API.

export function delay<T>(value: T, ms = 400 + Math.random() * 300): Promise<T> {
    return new Promise((resolve) => setTimeout(() => resolve(value), ms));
}

export function generateId(prefix: string): string {
    return `${prefix}-${Math.random().toString(36).slice(2, 10)}`;
}

export function generateUlid(): string {
    const alphabet = '0123456789ABCDEFGHJKMNPQRSTVWXYZ';
    let out = '01';
    for (let i = 0; i < 24; i++) out += alphabet[Math.floor(Math.random() * alphabet.length)];
    return out;
}

// Simule une erreur réseau occasionnelle (désactivée par défaut — mettre
// FAILURE_RATE > 0 pour tester les états d'erreur de l'UI pendant la démo).
const FAILURE_RATE = 0;
export function maybeFail(message: string) {
    if (Math.random() < FAILURE_RATE) {
        throw new Error(message);
    }
}
