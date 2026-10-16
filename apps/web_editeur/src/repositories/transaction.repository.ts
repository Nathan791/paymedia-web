// src/repositories/transaction.repository.ts
import { PayoutRequest, Transaction } from '@/models';
import { MOCK_PAYOUTS, MOCK_TRANSACTIONS } from '@/data/mock';
import { delay, generateId } from './_utils';

let transactionsDb: Transaction[] = MOCK_TRANSACTIONS.map((t) => ({ ...t }));
let payoutsDb: PayoutRequest[] = MOCK_PAYOUTS.map((p) => ({ ...p }));

export const transactionRepository = {
    async list(): Promise<Transaction[]> {
        await delay(null);
        return [...transactionsDb].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    },

    async listPayouts(): Promise<PayoutRequest[]> {
        await delay(null, 300);
        return [...payoutsDb].sort((a, b) => new Date(b.requestedAt).getTime() - new Date(a.requestedAt).getTime());
    },

    async requestPayout(amount: number, destination: string): Promise<PayoutRequest> {
        await delay(null, 600);
        const payout: PayoutRequest = {
            id: generateId('pay'),
            amount,
            currency: 'XAF',
            status: 'pending',
            requestedAt: new Date().toISOString(),
            paidAt: null,
            destination,
        };
        payoutsDb = [payout, ...payoutsDb];
        return { ...payout };
    },
};
