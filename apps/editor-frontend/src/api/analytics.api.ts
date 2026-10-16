// src/api/analytics.api.ts
import { catalogClient } from './client';  // ← Changé de apiClient à catalogClient
import { DashboardStats, Analytics } from '@/models';

export const analyticsApi = {
    // Récupérer les statistiques du dashboard
    getDashboardStats: async (params?: { days?: number }): Promise<DashboardStats> => {
        const response = await catalogClient.get('/analytics/editor/dashboard', { params });
        if (response.data?.success) {
            return response.data.data;
        }
        return response.data;
    },

    // Récupérer l'évolution des ventes
    getSalesHistory: async (params?: { days?: number }): Promise<Analytics[]> => {
        const response = await catalogClient.get('/analytics/editor/sales-history', { params });
        if (response.data?.success) {
            return response.data.data;
        }
        return response.data;
    },

    // Récupérer le top des contenus
    getTopContents: async (params?: { limit?: number }): Promise<Analytics[]> => {
        const response = await catalogClient.get('/analytics/editor/top-contents', { params });
        if (response.data?.success) {
            return response.data.data;
        }
        return response.data;
    },

    // Récupérer les statistiques des triggers
    getTriggerStats: async (params?: { days?: number }): Promise<Analytics[]> => {
        const response = await catalogClient.get('/analytics/editor/triggers', { params });
        if (response.data?.success) {
            return response.data.data;
        }
        return response.data;
    },
};