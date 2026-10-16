// services/user.service.ts
import axios from 'axios';
import { buildHeaders } from '../utils/headers';
import { AppOrigin } from '../types';

const API_URL = process.env.API_URL || 'http://192.168.100.101:8000/api/v1/core';

export const userService = {
    getAll: async (origin: AppOrigin, token: string, limit: number = 1000) => {
        const headers = buildHeaders(origin, token);
        const response = await axios.get(`${API_URL}/users?limit=${limit}`, { headers });
        return response.data;
    },

    getOne: async (origin: AppOrigin, token: string, id: string) => {
        const headers = buildHeaders(origin, token);
        const response = await axios.get(`${API_URL}/users/${id}`, { headers });
        return response.data;
    },

    update: async (origin: AppOrigin, token: string, id: string, data: any) => {
        const headers = buildHeaders(origin, token);
        const response = await axios.put(`${API_URL}/users/${id}`, data, { headers });
        return response.data;
    },

    delete: async (origin: AppOrigin, token: string, id: string) => {
        const headers = buildHeaders(origin, token);
        const response = await axios.delete(`${API_URL}/users/${id}`, { headers });
        return response.data;
    },
};