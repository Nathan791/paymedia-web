import client from './client';

export const authApi = {
    login: (email: string, password: string) =>
        client.post('/auth/login', { email, password }),

    me: () =>
        client.get('/auth/me'),

    logout: () =>
        client.post('/auth/logout'),
};











/*
import client from './client';

 // API d'authentification - utilise l'API réelle (port 8000)

export const authApi = {
    login: (email: string, password: string) =>
        client.post('/auth/login', { email, password }),

    me: () =>
        client.get('/auth/me'),

    logout: () =>
        client.post('/auth/logout'),
};

 */