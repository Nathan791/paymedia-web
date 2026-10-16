import { create } from 'zustand';
import { transactionApi } from '@/api/transaction.api';
import { Transaction, TransactionStats } from '@/models';

// Définition du type de l'état
interface TransactionState {
    // État
    transactions: Transaction[];
    currentTransaction: Transaction | null;
    stats: TransactionStats | null;
    isLoading: boolean;
    error: string | null;
    filters: {
        start_date?: string;
        end_date?: string;
        content_id?: number;
        status?: string;
    };

    // Actions
    fetchTransactions: (filters?: TransactionState['filters']) => Promise<void>;
    fetchTransaction: (id: number) => Promise<void>;
    fetchStats: (filters?: { start_date?: string; end_date?: string }) => Promise<void>;
    exportCSV: (filters?: { start_date?: string; end_date?: string }) => Promise<Blob>;
    setFilters: (filters: Partial<TransactionState['filters']>) => void;
    clearError: () => void;
    reset: () => void;
}

// État initial
const initialState = {
    transactions: [],
    currentTransaction: null,
    stats: null,
    isLoading: false,
    error: null,
    filters: {},
};

// Création du store
export const useTransactionStore = create<TransactionState>((set, get) => ({
    ...initialState,

    // Récupérer toutes les transactions de l'éditeur
    fetchTransactions: async (filters = {}) => {
        set({ isLoading: true, error: null });
        try {
            const currentFilters = { ...get().filters, ...filters };
            const transactions = await transactionApi.getAll(currentFilters);
            set({
                transactions,
                isLoading: false,
                filters: currentFilters,
            });
        } catch (error: any) {
            set({
                error: error.response?.data?.message || 'Erreur de chargement des transactions',
                isLoading: false,
            });
            throw error;
        }
    },

    // Récupérer une transaction spécifique
    fetchTransaction: async (id: number) => {
        set({ isLoading: true, error: null });
        try {
            const transaction = await transactionApi.getOne(id);
            set({
                currentTransaction: transaction,
                isLoading: false,
            });
        } catch (error: any) {
            set({
                error: error.response?.data?.message || 'Erreur de chargement de la transaction',
                isLoading: false,
            });
            throw error;
        }
    },

    // Récupérer les statistiques des transactions
    fetchStats: async (filters = {}) => {
        set({ isLoading: true, error: null });
        try {
            const stats = await transactionApi.getStats(filters);
            set({
                stats,
                isLoading: false,
            });
        } catch (error: any) {
            set({
                error: error.response?.data?.message || 'Erreur de chargement des statistiques',
                isLoading: false,
            });
            throw error;
        }
    },

    // Exporter les transactions en CSV
    exportCSV: async (filters = {}) => {
        set({ isLoading: true, error: null });
        try {
            const blob = await transactionApi.exportCSV(filters);
            set({ isLoading: false });
            return blob;
        } catch (error: any) {
            set({
                error: error.response?.data?.message || "Erreur d'export du CSV",
                isLoading: false,
            });
            throw error;
        }
    },

    // Modifier les filtres
    setFilters: (filters) => {
        set((state) => ({
            filters: { ...state.filters, ...filters },
        }));
        const currentFilters = { ...get().filters, ...filters };
        get().fetchTransactions(currentFilters);
    },

    // Effacer les erreurs
    clearError: () => {
        set({ error: null });
    },

    // Réinitialiser le store
    reset: () => {
        set(initialState);
    },
}));