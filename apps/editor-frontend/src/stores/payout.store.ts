// src/stores/payout.store.ts
import { create } from 'zustand';
import { payoutApi } from '@/api/payout.api';
import { Payout, PayoutStats } from '@/models';

// Définition du type de l'état
interface PayoutState {
    // État
    payouts: Payout[];
    currentPayout: Payout | null;
    stats: PayoutStats | null;
    isLoading: boolean;
    error: string | null;
    filters: {
        status?: string;
        period_start?: string;
        period_end?: string;
    };

    // Actions
    fetchPayouts: (filters?: PayoutState['filters']) => Promise<void>;
    fetchPayout: (id: string) => Promise<void>;
    fetchStats: () => Promise<void>;
    downloadStatement: (id: string) => Promise<Blob>;
    setFilters: (filters: Partial<PayoutState['filters']>) => void;
    clearError: () => void;
    reset: () => void;
}

// État initial
const initialState = {
    payouts: [],
    currentPayout: null,
    stats: null,
    isLoading: false,
    error: null,
    filters: {},
};

// Création du store
export const usePayoutStore = create<PayoutState>((set, get) => ({
    ...initialState,

    // Récupérer tous les reversements de l'éditeur
    fetchPayouts: async (filters = {}) => {
        set({ isLoading: true, error: null });
        try {
            const currentFilters = { ...get().filters, ...filters };
            const payouts = await payoutApi.getAll(currentFilters);
            set({
                payouts,
                isLoading: false,
                filters: currentFilters,
            });
        } catch (error: any) {
            set({
                error: error.response?.data?.message || 'Erreur de chargement des reversements',
                isLoading: false,
            });
            throw error;
        }
    },

    // Récupérer un reversement spécifique
    fetchPayout: async (id: string) => {
        set({ isLoading: true, error: null });
        try {
            const payout = await payoutApi.getOne(id);
            set({
                currentPayout: payout,
                isLoading: false,
            });
        } catch (error: any) {
            set({
                error: error.response?.data?.message || 'Erreur de chargement du reversement',
                isLoading: false,
            });
            throw error;
        }
    },

    // Récupérer les statistiques des reversements
    fetchStats: async () => {
        set({ isLoading: true, error: null });
        try {
            const stats = await payoutApi.getStats();
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

    // Télécharger un relevé de reversement
    downloadStatement: async (id: string) => {
        set({ isLoading: true, error: null });
        try {
            const blob = await payoutApi.downloadStatement(id);
            set({ isLoading: false });
            return blob;
        } catch (error: any) {
            set({
                error: error.response?.data?.message || 'Erreur de téléchargement du relevé',
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
        get().fetchPayouts(currentFilters);
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