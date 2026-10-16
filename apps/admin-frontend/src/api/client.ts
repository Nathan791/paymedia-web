import axios from 'axios';

const API_URL = 'http://localhost:4000/api';

const client = axios.create({
    baseURL: API_URL,
    headers: { 'Content-Type': 'application/json' },
});

//  Intercepteur avec logs détaillés
client.interceptors.request.use((config) => {
    const token = localStorage.getItem('adminToken');
    console.log(' Intercepteur client.ts:');
    console.log(' Token dans localStorage:', token ? `${token.substring(0, 20)}...` : ' AUCUN');

    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
        console.log(' Token ajouté au header');
    } else {
        console.warn('️ Aucun token trouvé, requête non authentifiée');
    }
    return config;
});

//  Intercepteur de réponse
client.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response?.status === 401) {
            localStorage.removeItem('adminToken');
            localStorage.removeItem('adminUser');
            window.location.href = '/login';
        }
        return Promise.reject(error);
    }
);

export default client;



/* import axios from 'axios';

const API_URL = 'http://localhost:4000/api';

const client = axios.create({
    baseURL: API_URL,
    headers: { 'Content-Type': 'application/json' },
});

//  Intercepteur pour ajouter le token
client.interceptors.request.use((config) => {
    const token = localStorage.getItem('adminToken');
    console.log('Intercepteur client.ts - Token:', token ? ' présent' : ' absent');
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    } else {
        console.warn('⚠️ Aucun token trouvé dans localStorage');
    }
    return config;
});

client.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response?.status === 401) {
            localStorage.removeItem('adminToken');
            localStorage.removeItem('adminUser');
            window.location.href = '/login';
        }
        return Promise.reject(error);
    }
);

export default client;



/*
import axios from 'axios';


const API_URL = 'http://localhost:3001/api/admin';


const client = axios.create({
    baseURL: API_URL,
    headers: { 'Content-Type': 'application/json' },
});

// Intercepteur pour ajouter le token
client.interceptors.request.use((config) => {
    const token = localStorage.getItem('adminToken');
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

// Intercepteur pour gérer les erreurs 401
client.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response?.status === 401) {
            localStorage.removeItem('adminToken');
            localStorage.removeItem('adminUser');
            window.location.href = '/login';
        }
        return Promise.reject(error);
    }
);

// Export par défaut (pas de conflit)
export default client;

 */



