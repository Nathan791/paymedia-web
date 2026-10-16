// src/services/http.ts

const API_URL = 'http://192.168.100.101:8000/api/v1';

export async function http<T>(
    endpoint: string,
    options: RequestInit = {},
): Promise<T> {
    const response = await fetch(`${API_URL}${endpoint}`, {
        ...options,
        headers: {
            'Content-Type': 'application/json',
            'x-app-origin': 'web_editor',
            ...(options.headers ?? {}),
        },
    });

    const data = await response.json();

    if (!response.ok || data.success === false) {
        throw new Error(
            data.message ?? 'Une erreur est survenue.',
        );
    }

    return data;
}