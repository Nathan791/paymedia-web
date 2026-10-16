import axios from 'axios';

import {
    authStorage,
    type AuthUser,
} from '@/auth/auth.storage';

const AUTH_URL =
    import.meta.env.VITE_AUTH_URL ||
    'http://localhost:4000';

interface LoginResponse {
    access_token: string;
    user: AuthUser;
}

export const authApi = {
    async login(
        email: string,
        password: string
    ): Promise<LoginResponse> {
        const response =
            await axios.post<LoginResponse>(
                `${AUTH_URL}/auth/login`,
                {
                    email,
                    password,
                }
            );

        const result = response.data;

        authStorage.setToken(
            result.access_token
        );

        authStorage.setUser(
            result.user
        );

        return result;
    },

    logout() {
        authStorage.clear();

        window.location.href =
            '/login';
    },
};















/*import { authClient } from './client';
//import { User } from '@/models';

export interface LoginRequest {
    email: string;
    password: string;
}
// src/api/auth.api.ts
export interface LoginResponse {
    accessToken: string;
    refreshToken: string;
    expiresIn: number;
    targetApp: string;

    user: {
        id: number;
        ulid: string;
        username: string;
        email: string;
        whatsappPhone: string;
        countryCode: string;
        role: string;
        isVerified: boolean;
        isActive: boolean;
        lastLoginAt: string;
        createdAt: string;
        updatedAt: string;
        deletedAt: string | null;
        walletId: number;

        wallet: {
            ulid: string;
            balance: string;
            currency: string;
        };

        effectiveRole: string;
    };

    accessJti: string;
    refreshJti: string;
}


export interface RegisterRequest {
    username: string;
    email: string;
    password: string;
    phone: string;
    country_code: string;
    currency: string;
}

export const authApi = {
    // Connexion
    login: async (data: LoginRequest): Promise<LoginResponse> => {
        const response = await authClient.post('/auth/login', data);

        console.log(
            ' authApi.login - Réponse brute:',
            response.data
        );

        if (response.data?.success && response.data?.data) {
            return response.data.data;
        }

        return response.data;
    },

    // Inscription
    register: async (data: RegisterRequest): Promise<LoginResponse> => {
        const response = await authClient.post('/auth/register', data);

        console.log(
            ' authApi.register - Réponse brute:',
            response.data
        );

        if (response.data?.success && response.data?.data) {
            return response.data.data;
        }

        return response.data;
    },
    // Déconnexion
    logout: async (): Promise<void> => {
        await authClient.post('/auth/logout');
        localStorage.removeItem('access_token');
        localStorage.removeItem('user');
    },

};

 */

