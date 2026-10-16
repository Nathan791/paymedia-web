import axios from 'axios';

//  On définit l'adresse du mock (celui qui tourne sur le port 3001)
const MOCK_API_URL = 'http://localhost:3001/api/admin';

//  On crée le client qui va envoyer les requêtes vers le mock
const mockClient = axios.create({
    baseURL: MOCK_API_URL,
    headers: { 'Content-Type': 'application/json' },
});

//  On ajoute aussi le token pour que le mock sache qu'on est authentifié
mockClient.interceptors.request.use((config) => {
    const token = localStorage.getItem('adminToken');
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

export default mockClient;