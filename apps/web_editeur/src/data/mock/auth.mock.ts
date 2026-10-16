// src/data/mock/auth.mock.ts
import { EditorProfile } from '@/models';

export const MOCK_EDITOR: EditorProfile = {
    id: '34',
    ulid: '01KZBF3NXJ5DNQ1KRGVZYFTH0E',
    username: 'neymar',
    email: 'ney@paymedia.com',
    role: 'journalist',
    displayName: 'Neymar Ngoma',
    organization: 'Le Quotidien du Littoral',
    memberSince: '2025-02-14T00:00:00.000Z',
    walletBalance: 284500,
    walletCurrency: 'XAF',
};

// Identifiants acceptés par le mock de connexion (voir auth.repository.ts).
export const MOCK_CREDENTIALS = {
    email: 'ney@paymedia.com',
    password: 'paymedia2026',
};
