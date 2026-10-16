// src/api/user.api.ts
import { authClient } from './client';
import { User } from '@/models';

export const userApi = {
    getProfile: async (): Promise<User> => {
        const response = await authClient.get('/users/me');
        return response.data;
    },

    updateProfile: async (data: Partial<User>): Promise<User> => {
        const response = await authClient.patch('/users/me', data);
        return response.data;
    },
};