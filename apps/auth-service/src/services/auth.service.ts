// services/auth.service.ts
import axios from 'axios';
import { buildHeaders } from '../utils/headers';
import { AppOrigin } from '../types';


const API_URL = process.env.API_URL || 'http://192.168.100.101:8000/api/v1/core';

export const authService = {
    login: async (origin: AppOrigin, email: string, password: string) => {
        const headers = {
            'Content-Type': 'application/json',
            'x-app-origin': origin,
        };

        console.log('Auth Service - Login');
        console.log(' Headers:', headers);
        console.log(' URL:', `${API_URL}/auth/login`);
        console.log(' Body:', { email, password: '***' });

        try {
            const response = await axios.post(
                `${API_URL}/auth/login`,
                { email, password },
                { headers }
            );

            //  LOGGER LA RÉPONSE
            console.log(' Auth Service - Réponse status:', response.status);
            console.log(' Auth Service - Réponse data:', JSON.stringify(response.data, null, 2));

            //
            //  RETOURNER UN FORMAT STANDARDISÉ
            return {
                success: true,
                data: response.data
            };
        } catch (error: any) {
            console.error(' Auth Service - Erreur:', error.response?.status, error.response?.data);
            throw error;
        }
    },

    register: async (origin: AppOrigin, data: any) => {
        const headers = {
            'Content-Type': 'application/json',
            'x-app-origin': origin,
        };

        console.log(' Auth Service - Register');
        console.log(' Headers:', headers);
        console.log(' Body:', { ...data, password: '***' });

        try {
            const response = await axios.post(
                `${API_URL}/auth/register`,
                data,
                { headers }
            );

            console.log('Auth Service - Register response:', response.status);
            return response.data;
        } catch (error: any) {
            console.error('Auth Service - Register error:', error.response?.data);
            throw error;
        }
    },



    logout: async (origin: AppOrigin, token: string) => {
        const headers = {
            'Content-Type': 'application/json',
            'x-app-origin': origin,
            'Authorization': `Bearer ${token}`,
        };

        const response = await axios.post(
            `${API_URL}/auth/logout`,
            {},
            { headers }
        );
        return response.data;
    },

    getProfile: async (origin: AppOrigin, token: string) => {
        const headers = {
            'Content-Type': 'application/json',
            'x-app-origin': origin,
            'Authorization': `Bearer ${token}`,
        };

        const response = await axios.get(`${API_URL}/auth/me`, { headers });
        return response.data;
    },

};

