// src/api/trigger.api.ts
import { catalogClient } from './client';  // ← Changé de apiClient à catalogClient
import { Trigger, TriggerStats } from '@/models';

export const triggerApi = {
    // Récupérer les triggers par contenu
    getByContent: async (contentId: string): Promise<Trigger[]> => {
        const response = await catalogClient.get(`/content/${contentId}/triggers`);
        if (response.data?.success) {
            return response.data.data;
        }
        return response.data;
    },

    // Récupérer tous les triggers de l'éditeur
    getAll: async (): Promise<Trigger[]> => {
        const response = await catalogClient.get('/triggers/editor');
        if (response.data?.success) {
            return response.data.data;
        }
        return response.data;
    },

    // Créer un QR code
    createQR: async (contentId: string): Promise<Trigger> => {
        const response = await catalogClient.post(`/content/${contentId}/triggers/qr`);
        if (response.data?.success) {
            return response.data.data;
        }
        return response.data;
    },

    // Créer un short-code
    createShortCode: async (contentId: string): Promise<Trigger> => {
        const response = await catalogClient.post(`/content/${contentId}/triggers/shortcode`);
        if (response.data?.success) {
            return response.data.data;
        }
        return response.data;
    },

    // Créer un watermark audio
    createAudioWatermark: async (contentId: string, audioFile: File): Promise<Trigger> => {
        const formData = new FormData();
        formData.append('audio', audioFile);
        const response = await catalogClient.post(`/content/${contentId}/triggers/audio`, formData, {
            headers: { 'Content-Type': 'multipart/form-data' },
        });
        if (response.data?.success) {
            return response.data.data;
        }
        return response.data;
    },

    // Supprimer un trigger
    delete: async (id: string): Promise<void> => {
        const response = await catalogClient.delete(`/triggers/${id}`);
        return response.data;
    },

    // Récupérer les statistiques d'un trigger
    getStats: async (id: string): Promise<TriggerStats> => {
        const response = await catalogClient.get(`/triggers/${id}/stats`);
        if (response.data?.success) {
            return response.data.data;
        }
        return response.data;
    },

    // Télécharger un QR code
    downloadQR: async (id: string): Promise<Blob> => {
        const response = await catalogClient.get(`/triggers/${id}/qr/download`, {
            responseType: 'blob',
        });
        return response.data;
    },
};