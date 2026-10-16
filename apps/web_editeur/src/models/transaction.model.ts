// src/models/transaction.model.ts

export type TransactionType = 'purchase' | 'refund' | 'commission' | 'payout';
export type TransactionStatus = 'completed' | 'pending' | 'failed' | 'flagged';

export interface Transaction {
    id: string;
    type: TransactionType;
    status: TransactionStatus;
    contentId: string | null;
    contentTitle: string | null;
    buyerLabel: string | null; // ex: "Lecteur #4821" (anonymisé côté éditeur)
    amount: number;
    commission: number;
    net: number;
    currency: string;
    paymentMethod: 'orange_money' | 'mtn_momo' | 'carte_bancaire' | 'wave';
    createdAt: string;
    anomalyReason: string | null;
}

export interface PayoutRequest {
    id: string;
    amount: number;
    currency: string;
    status: 'pending' | 'processing' | 'paid' | 'rejected';
    requestedAt: string;
    paidAt: string | null;
    destination: string; // ex: numéro Mobile Money masqué
}

export const TRANSACTION_STATUS_COLORS: Record<TransactionStatus, string> = {
    completed: 'forest',
    pending: 'gold',
    failed: 'red',
    flagged: 'red',
};

export const TRANSACTION_TYPE_LABELS: Record<TransactionType, string> = {
    purchase: 'Achat',
    refund: 'Remboursement',
    commission: 'Commission',
    payout: 'Reversement',
};
