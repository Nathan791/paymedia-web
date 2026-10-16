// src/stores/transaction.store.ts
import { create } from 'zustand';
import { transactionService } from '@/services/transaction.service';
import { PayoutRequest, Transaction } from '@/models';

interface TransactionState {
    transactions: Transaction[];
    payouts: PayoutRequest[];
    isLoading: boolean;
    isSaving: boolean;
    error: string | null;
    fetchTransactions: () => Promise<void>;
    fetchPayouts: () => Promise<void>;
    requestPayout: (amount: number, availableBalance: number, destination: string) => Promise<void>;
    clearError: () => void;
}

export const useTransactionStore = create<TransactionState>((set, get) => ({
    transactions: [],
    payouts: [],
    isLoading: false,
    isSaving: false,
    error: null,

    fetchTransactions: async () => {
        set({ isLoading: true, error: null });
        try {
            const transactions = await transactionService.list();
            set({ transactions, isLoading: false });
        } catch (error: any) {
            set({ error: error.message || 'Erreur de chargement.', isLoading: false });
        }
    },

    fetchPayouts: async () => {
        try {
            const payouts = await transactionService.listPayouts();
            set({ payouts });
        } catch (error: any) {
            set({ error: error.message || 'Erreur de chargement des reversements.' });
        }
    },

    requestPayout: async (amount, availableBalance, destination) => {
        set({ isSaving: true, error: null });
        try {
            const payout = await transactionService.requestPayout(amount, availableBalance, destination);
            set({ payouts: [payout, ...get().payouts], isSaving: false });
        } catch (error: any) {
            set({ error: error.message || 'Erreur lors de la demande.', isSaving: false });
            throw error;
        }
    },

    clearError: () => set({ error: null }),
}));
