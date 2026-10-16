// utils/headers.ts
import { AppOrigin } from '../types';

export const buildHeaders = (origin: AppOrigin, token?: string) => {
    const headers: Record<string, string> = {
        'Content-Type': 'application/json',
        'x-app-origin': origin,
    };

    if (token) {
        headers['Authorization'] = `Bearer ${token}`;
    }

    return headers;
};

export const buildMultipartHeaders = (origin: AppOrigin, token?: string) => {
    const headers: Record<string, string> = {
        'x-app-origin': origin,
    };

    if (token) {
        headers['Authorization'] = `Bearer ${token}`;
    }

    return headers;
};