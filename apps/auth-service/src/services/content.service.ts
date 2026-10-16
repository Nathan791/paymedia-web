// services/content.service.ts
import axios from 'axios';
import { buildHeaders, buildMultipartHeaders } from '../utils/headers';
import { AppOrigin } from '../types';

const CATALOG_API_URL = process.env.CATALOG_API_URL || 'http://192.168.100.101:8000/api/v1/catalog';

export const contentService = {
    getAll: async (origin: AppOrigin, token: string) => {
        const headers = buildHeaders(origin, token);
        const response = await axios.get(`${CATALOG_API_URL}/content`, { headers });
        return response.data;
    },

    getOne: async (origin: AppOrigin, token: string, id: string) => {
        const headers = buildHeaders(origin, token);
        const response = await axios.get(`${CATALOG_API_URL}/content/${id}`, { headers });
        return response.data;
    },

    create: async (origin: AppOrigin, token: string, data: any) => {
        const headers = buildHeaders(origin, token);
        const response = await axios.post(`${CATALOG_API_URL}/content`, data, { headers });
        return response.data;
    },

    update: async (origin: AppOrigin, token: string, id: string, data: any) => {
        const headers = buildHeaders(origin, token);
        const response = await axios.put(`${CATALOG_API_URL}/content/${id}`, data, { headers });
        return response.data;
    },

    delete: async (origin: AppOrigin, token: string, id: string) => {
        const headers = buildHeaders(origin, token);
        const response = await axios.delete(`${CATALOG_API_URL}/content/${id}`, { headers });
        return response.data;
    },

    changeStatus: async (origin: AppOrigin, token: string, id: string, status: string) => {
        const headers = buildHeaders(origin, token);
        const response = await axios.patch(
            `${CATALOG_API_URL}/content/${id}/status`,
            { status },
            { headers }
        );
        return response.data;
    },

    approve: async (origin: AppOrigin, token: string, id: string) => {
        const headers = buildHeaders(origin, token);
        const response = await axios.patch(`${CATALOG_API_URL}/content/${id}/approve`, {}, { headers });
        return response.data;
    },

    block: async (origin: AppOrigin, token: string, id: string) => {
        const headers = buildHeaders(origin, token);
        const response = await axios.patch(`${CATALOG_API_URL}/content/${id}/block`, {}, { headers });
        return response.data;
    },

    unblock: async (origin: AppOrigin, token: string, id: string) => {
        const headers = buildHeaders(origin, token);
        const response = await axios.patch(`${CATALOG_API_URL}/content/${id}/unblock`, {}, { headers });
        return response.data;
    },

    archive: async (origin: AppOrigin, token: string, id: string) => {
        const headers = buildHeaders(origin, token);
        const response = await axios.patch(`${CATALOG_API_URL}/content/${id}/archive`, {}, { headers });
        return response.data;
    },
};