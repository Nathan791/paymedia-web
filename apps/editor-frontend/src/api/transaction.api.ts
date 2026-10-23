// src/api/transaction.api.ts
import { catalogClient } from './client.js';  // ← Changé de apiClient à catalogClient
import { Transaction, TransactionStats } from '@/models';

export const transactionApi = {
    // Récupérer toutes les transactions de l'éditeur
    getAll: async (params?: {
        start_date?: string;
        end_date?: string;
        content_id?: string;
        status?: string;
    }): Promise<Transaction[]> => {
        const response = await catalogClient.get('/transactions/editor', { params });
        if (response.data?.success) {
            return response.data.data;
        }
        return response.data;
    },

    // Récupérer une transaction spécifique
    getOne: async (id: string): Promise<Transaction> => {
        const response = await catalogClient.get(`/transactions/${id}`);
        if (response.data?.success) {
            return response.data.data;
        }
        return response.data;
    },

    // Récupérer les statistiques
    getStats: async (params?: {
        start_date?: string;
        end_date?: string;
    }): Promise<TransactionStats> => {
        const response = await catalogClient.get('/transactions/editor/stats', { params });
        if (response.data?.success) {
            return response.data.data;
        }
        return response.data;
    },

    // Exporter les transactions en CSV
    exportCSV: async (params?: {
        start_date?: string;
        end_date?: string;
    }): Promise<Blob> => {
        const response = await catalogClient.get('/transactions/editor/export', {
            params,
            responseType: 'blob',
        });
        return response.data;
    },
};