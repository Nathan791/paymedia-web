// src/api/payout.api.ts
import { catalogClient } from './client';  // ← Changé de apiClient à catalogClient
import { Payout, PayoutStats } from '@/models';

export const payoutApi = {
    // Récupérer tous les reversements de l'éditeur
    getAll: async (params?: {
        status?: string;
        period_start?: string;
        period_end?: string;
    }): Promise<Payout[]> => {
        const response = await catalogClient.get('/payouts/editor', { params });
        if (response.data?.success) {
            return response.data.data;
        }
        return response.data;
    },

    // Récupérer un reversement spécifique
    getOne: async (id: string): Promise<Payout> => {
        const response = await catalogClient.get(`/payouts/${id}`);
        if (response.data?.success) {
            return response.data.data;
        }
        return response.data;
    },

    // Récupérer les statistiques
    getStats: async (): Promise<PayoutStats> => {
        const response = await catalogClient.get('/payouts/editor/stats');
        if (response.data?.success) {
            return response.data.data;
        }
        return response.data;
    },

    // Télécharger un relevé
    downloadStatement: async (id: string): Promise<Blob> => {
        const response = await catalogClient.get(`/payouts/${id}/statement`, {
            responseType: 'blob',
        });
        return response.data;
    },
};