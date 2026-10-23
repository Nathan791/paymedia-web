import { create } from 'zustand';
import { analyticsApi } from '@/api/analytics.api.js';
import { DashboardStats, Analytics } from '@/models';

// Définition du type de l'état
interface AnalyticsState {
    // État
    dashboardStats: DashboardStats | null;
    salesHistory: Analytics[];
    topContents: Analytics[];
    triggerStats: Analytics[];
    isLoading: boolean;
    error: string | null;

    // Actions
    fetchDashboardStats: (days?: number) => Promise<void>;
    fetchSalesHistory: (days?: number) => Promise<void>;
    fetchTopContents: (limit?: number) => Promise<void>;
    fetchTriggerStats: (days?: number) => Promise<void>;
    refreshAll: (days?: number) => Promise<void>;
    clearError: () => void;
    reset: () => void;
}

// État initial
const initialState = {
    dashboardStats: null,
    salesHistory: [],
    topContents: [],
    triggerStats: [],
    isLoading: false,
    error: null,
};

// Création du store
export const useAnalyticsStore = create<AnalyticsState>((set, _get) => ({
    ...initialState,

    // Récupérer les statistiques du dashboard
    fetchDashboardStats: async (days = 30) => {
        set({ isLoading: true, error: null });
        try {
            const stats = await analyticsApi.getDashboardStats({ days });
            set({
                dashboardStats: stats,
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

    // Récupérer l'historique des ventes
    fetchSalesHistory: async (days = 30) => {
        set({ isLoading: true, error: null });
        try {
            const history = await analyticsApi.getSalesHistory({ days });
            set({
                salesHistory: history,
                isLoading: false,
            });
        } catch (error: any) {
            set({
                error: error.response?.data?.message || "Erreur de chargement de l'historique",
                isLoading: false,
            });
            throw error;
        }
    },

    // Récupérer le top des contenus
    fetchTopContents: async (limit = 5) => {
        set({ isLoading: true, error: null });
        try {
            const contents = await analyticsApi.getTopContents({ limit });
            set({
                topContents: contents,
                isLoading: false,
            });
        } catch (error: any) {
            set({
                error: error.response?.data?.message || 'Erreur de chargement des top contenus',
                isLoading: false,
            });
            throw error;
        }
    },

    // Récupérer les statistiques des triggers
    fetchTriggerStats: async (days = 30) => {
        set({ isLoading: true, error: null });
        try {
            const stats = await analyticsApi.getTriggerStats({ days });
            set({
                triggerStats: stats,
                isLoading: false,
            });
        } catch (error: any) {
            set({
                error: error.response?.data?.message || 'Erreur de chargement des statistiques triggers',
                isLoading: false,
            });
            throw error;
        }
    },

    // Rafraîchir toutes les données
    refreshAll: async (days = 30) => {
        set({ isLoading: true, error: null });
        try {
            const [dashboardStats, salesHistory, topContents, triggerStats] = await Promise.all([
                analyticsApi.getDashboardStats({ days }),
                analyticsApi.getSalesHistory({ days }),
                analyticsApi.getTopContents({ limit: 5 }),
                analyticsApi.getTriggerStats({ days }),
            ]);
            set({
                dashboardStats,
                salesHistory,
                topContents,
                triggerStats,
                isLoading: false,
            });
        } catch (error: any) {
            set({
                error: error.response?.data?.message || 'Erreur de rafraîchissement des données',
                isLoading: false,
            });
            throw error;
        }
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