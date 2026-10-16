import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || '/api';

const createClient = () => {
    const client = axios.create({
        baseURL: API_URL,
        timeout: 120000,
        headers: {
            'x-app-origin': 'web_editor',
        },
        maxBodyLength: 100 * 1024 * 1024,
        maxContentLength: 100 * 1024 * 1024,
    });

    client.interceptors.request.use((config) => {
        const token = localStorage.getItem('access_token');

        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }

        return config;
    });

    client.interceptors.response.use(
        (response) => response,
        (error) => {
            if (error.response?.status === 401) {
                localStorage.removeItem('access_token');
                localStorage.removeItem('auth-storage');
                localStorage.removeItem('user_ulid');

                window.location.href = '/login';
            }

            return Promise.reject(error);
        }
    );

    return client;
};

export const authClient = createClient();
export const catalogClient = createClient();

export const directUploadClient = axios.create({
    baseURL: 'http://192.168.100.101:8000/api/v1',
    timeout: 120000,
    maxBodyLength: 100 * 1024 * 1024,
    maxContentLength: 100 * 1024 * 1024,
    headers: {
        'x-app-origin': 'web_editor',
    },
});

directUploadClient.interceptors.request.use((config) => {
    const token = localStorage.getItem('access_token');

    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
});

export default {
    authClient,
    catalogClient,
    directUploadClient,
};