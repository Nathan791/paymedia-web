/*import Fastify from 'fastify';
import cors from '@fastify/cors';
import axios from 'axios';
import dotenv from 'dotenv';

dotenv.config();

const fastify = Fastify({ logger: true });

// CORS : le frontend peut appeler le service auth
fastify.register(cors, {
    origin: 'http://localhost:5173',
    credentials: true,
});

//  URL de l'API réelle
const API_URL = process.env.API_URL || 'http://192.168.100.101:8000/api/v1/core';
const CATALOG_API_URL = process.env.CATALOG_API_URL || 'http://192.168.100.101:8000/api/v1/catalog';

//  HEADERS OBLIGATOIRES POUR L'API RÉELLE
const defaultHeaders = {
    'Content-Type': 'application/json',
    'x-app-origin': 'web_admin',
};

// Route : Login
fastify.post('/api/auth/login', async (request, reply) => {
    try {
        const { email, password } = request.body as { email: string; password: string };

        console.log(` Tentative de login pour ${email}`);

        //  ON AJOUTE LE HEADER DANS LA REQUÊTE VERS L'API RÉELLE
        const response = await axios.post(
            `${API_URL}/auth/login`,
            { email, password },
            { headers: defaultHeaders  }
        );

        console.log(`Login réussi pour ${email}`);
        return reply.send(response.data);
    } catch (error: any) {
        console.error(` Erreur login:`, error.response?.data || error.message);
        const status = error.response?.status || 500;
        const data = error.response?.data || { error: 'Erreur interne' };
        return reply.status(status).send(data);
    }
});

//  Route : Profil


fastify.get('/api/auth/me', async (request, reply) => {
    try {
        const token = request.headers.authorization?.replace('Bearer ', '');

        if (!token) {
            return reply.status(401).send({ error: 'Token manquant' });
        }

        const response = await axios.get(`${API_URL}/auth/me`, {
            headers: {
                'Content-Type': 'application/json',
                'x-app-origin': 'web_admin',
                Authorization: `Bearer ${token}`,
            },
        });

        return reply.send(response.data);
    } catch (error: any) {
        const status = error.response?.status || 500;
        const data = error.response?.data || { error: 'Erreur interne' };
        return reply.status(status).send(data);
    }
});

//  Route : Logout
fastify.post('/api/auth/logout', async (request, reply) => {
    try {
        const token = request.headers.authorization?.replace('Bearer ', '');

        if (!token) {
            return reply.status(401).send({ error: 'Token manquant' });
        }

        await axios.post(
            `${API_URL}/auth/logout`,
            {},
            {
                headers: {
                    'Content-Type': 'application/json',
                    'x-app-origin': 'web_admin',
                    Authorization: `Bearer ${token}`,
                },
            }
        );

        return reply.send({ success: true });
    } catch (error: any) {
        const status = error.response?.status || 500;
        const data = error.response?.data || { error: 'Erreur interne' };
        return reply.status(status).send(data);
    }
});

// ============================================================
// PROXY POUR LES UTILISATEURS
// ============================================================

//  Récupérer tous les utilisateurs

fastify.get('/api/users', async (request, reply) => {
    try {
        const token = request.headers.authorization?.replace('Bearer ', '');
        if (!token) {
            return reply.status(401).send({ error: 'Token manquant' });
        }
        const limit = 1000;
        const response = await axios.get(`${API_URL}/users?limit=${limit}`, {
            headers: {
                ...defaultHeaders,
                Authorization: `Bearer ${token}`,
                    'x-app-origin': 'web_admin',

            },
        });

        return reply.send(response.data);
    } catch (error: any) {
        console.error(' Erreur proxy /users:', error.response?.status, error.response?.data);
        const status = error.response?.status || 500;
        const data = error.response?.data || { error: 'Erreur interne' };
        return reply.status(status).send(data);
    }
});

//  Créer un utilisateur (register)
fastify.post('/api/users', async (request, reply) => {
    try {
        const token = request.headers.authorization?.replace('Bearer ', '');
        const body = request.body;

        if (!token) {
            return reply.status(401).send({ error: 'Token manquant' });
        }


        const response = await axios.post(`${API_URL}/auth/register`, body, {
            headers: {
                ...defaultHeaders,
                Authorization: `Bearer ${token}`,
            },
        });

        return reply.send(response.data);
    } catch (error: any) {
        console.error(' Erreur POST /users (register):', error.response?.status, error.response?.data);
        const status = error.response?.status || 500;
        const data = error.response?.data || { error: 'Erreur interne' };
        return reply.status(status).send(data);
    }
});

// USER DETAIL
fastify.get('/api/users/:id/detail', async (request, reply) => {
    try {
        const token = request.headers.authorization?.replace('Bearer ', '');
        const { id } = request.params as { id: string };

        if (!token) {
            return reply.status(401).send({ error: 'Token manquant' });
        }

        const response = await axios.get(`${API_URL}/users/${id}`, {
            headers: {
                ...defaultHeaders,
                Authorization: `Bearer ${token}`,
            },
        });

        return reply.send(response.data);
    } catch (error: any) {
        console.error(' Erreur GET /users/:id/detail:', error.response?.status, error.response?.data);
        const status = error.response?.status || 500;
        const data = error.response?.data || { error: 'Erreur interne' };
        return reply.status(status).send(data);
    }
});
// MODIFIER UN UTILISATEU

fastify.put('/api/users/:id', async (request, reply) => {
    try {
        const token = request.headers.authorization?.replace('Bearer ', '');
        const { id } = request.params as { id: string };
        const body = request.body;

        if (!token) {
            return reply.status(401).send({ error: 'Token manquant' });
        }

        const response = await axios.put(`${API_URL}/users/${id}`, body, {
            headers: {
                ...defaultHeaders,
                Authorization: `Bearer ${token}`,
            },
        });

        return reply.send(response.data);
    } catch (error: any) {
        const status = error.response?.status || 500;
        const data = error.response?.data || { error: 'Erreur interne' };
        return reply.status(status).send(data);
    }
});

// SUPPRIMER UN UTILISATEUR
fastify.delete('/api/users/:id', async (request, reply) => {
    try {
        const token = request.headers.authorization?.replace('Bearer ', '');
        const { id } = request.params as { id: string };

        if (!token) {
            return reply.status(401).send({ error: 'Token manquant' });
        }

        const response = await axios.delete(`${API_URL}/users/${id}`, {
            headers: {
                ...defaultHeaders,
                Authorization: `Bearer ${token}`,
            },
        });

        return reply.send(response.data);
    } catch (error: any) {
        const status = error.response?.status || 500;
        const data = error.response?.data || { error: 'Erreur interne' };
        return reply.status(status).send(data);
    }
});

// ============================================================
// PROXY POUR LES CONTENUS
// ============================================================

// Récupérer tous les contenus
fastify.get('/api/contents', async (request, reply) => {
    try {
        const token = request.headers.authorization?.replace('Bearer ', '');
        if (!token) {
            return reply.status(401).send({ error: 'Token manquant' });
        }

        console.log(' GET /contents - Appel vers:', `${CATALOG_API_URL}/content`);

        const response = await axios.get(`${CATALOG_API_URL}/content`, {
            headers: {
                ...defaultHeaders,
                Authorization: `Bearer ${token}`,
            },
        });

        return reply.send(response.data);
    } catch (error: any) {
        console.error(' Erreur GET /contents:', error.response?.status, error.response?.data);
        const status = error.response?.status || 500;
        const data = error.response?.data || { error: 'Erreur interne' };
        return reply.status(status).send(data);
    }
});

// Créer un contenu
fastify.post('/api/contents', async (request, reply) => {
    try {
        const token = request.headers.authorization?.replace('Bearer ', '');
        const body = request.body;

        if (!token) {
            return reply.status(401).send({ error: 'Token manquant' });
        }

        console.log(' POST /contents - Appel vers:', `${CATALOG_API_URL}/content`);

        const response = await axios.post(`${CATALOG_API_URL}/content`, body, {
            headers: {
                ...defaultHeaders,
                Authorization: `Bearer ${token}`,
            },
        });

        return reply.send(response.data);
    } catch (error: any) {
        console.error(' Erreur POST /contents:', error.response?.status, error.response?.data);
        const status = error.response?.status || 500;
        const data = error.response?.data || { error: 'Erreur interne' };
        return reply.status(status).send(data);
    }
});
//  Récupérer le détail d'un contenu
fastify.get('/api/contents/:id/detail', async (request, reply) => {
    try {
        const token = request.headers.authorization?.replace('Bearer ', '');
        const { id } = request.params as { id: string };

        if (!token) {
            return reply.status(401).send({ error: 'Token manquant' });
        }

        const response = await axios.get(`${API_URL}/contents/${id}`, {
            headers: {
                ...defaultHeaders,
                Authorization: `Bearer ${token}`,
            },
        });

        return reply.send(response.data);
    } catch (error: any) {
        console.error(' Erreur GET /contents/:id/detail:', error.response?.status, error.response?.data);
        const status = error.response?.status || 500;
        const data = error.response?.data || { error: 'Erreur interne' };
        return reply.status(status).send(data);
    }
});



//  Modifier un contenu
fastify.put('/api/contents/:id', async (request, reply) => {
    try {
        const token = request.headers.authorization?.replace('Bearer ', '');
        const { id } = request.params as { id: string };
        const body = request.body;

        if (!token) {
            return reply.status(401).send({ error: 'Token manquant' });
        }

        const response = await axios.put(`${API_URL}/contents/${id}`, body, {
            headers: {
                ...defaultHeaders,
                Authorization: `Bearer ${token}`,
            },
        });

        return reply.send(response.data);
    } catch (error: any) {
        console.error(' Erreur PUT /contents/:id:', error.response?.status, error.response?.data);
        const status = error.response?.status || 500;
        const data = error.response?.data || { error: 'Erreur interne' };
        return reply.status(status).send(data);
    }
});

//  Supprimer un contenu
fastify.delete('/api/contents/:id', async (request, reply) => {
    try {
        const token = request.headers.authorization?.replace('Bearer ', '');
        const { id } = request.params as { id: string };

        if (!token) {
            return reply.status(401).send({ error: 'Token manquant' });
        }

        const response = await axios.delete(`${API_URL}/contents/${id}`, {
            headers: {
                ...defaultHeaders,
                Authorization: `Bearer ${token}`,
            },
        });

        return reply.send(response.data);
    } catch (error: any) {
        console.error(' Erreur DELETE /contents/:id:', error.response?.status, error.response?.data);
        const status = error.response?.status || 500;
        const data = error.response?.data || { error: 'Erreur interne' };
        return reply.status(status).send(data);
    }
});

//  Approuver un contenu
fastify.patch('/api/contents/:id/approve', async (request, reply) => {
    try {
        const token = request.headers.authorization?.replace('Bearer ', '');
        const { id } = request.params as { id: string };

        if (!token) {
            return reply.status(401).send({ error: 'Token manquant' });
        }

        const response = await axios.patch(`${API_URL}/contents/${id}/approve`, {}, {
            headers: {
                ...defaultHeaders,
                Authorization: `Bearer ${token}`,
            },
        });

        return reply.send(response.data);
    } catch (error: any) {
        console.error(' Erreur PATCH /contents/:id/approve:', error.response?.status, error.response?.data);
        const status = error.response?.status || 500;
        const data = error.response?.data || { error: 'Erreur interne' };
        return reply.status(status).send(data);
    }
});

//  Bloquer un contenu
fastify.patch('/api/contents/:id/block', async (request, reply) => {
    try {
        const token = request.headers.authorization?.replace('Bearer ', '');
        const { id } = request.params as { id: string };

        if (!token) {
            return reply.status(401).send({ error: 'Token manquant' });
        }

        const response = await axios.patch(`${API_URL}/contents/${id}/block`, {}, {
            headers: {
                ...defaultHeaders,
                Authorization: `Bearer ${token}`,
            },
        });

        return reply.send(response.data);
    } catch (error: any) {
        console.error(' Erreur PATCH /contents/:id/block:', error.response?.status, error.response?.data);
        const status = error.response?.status || 500;
        const data = error.response?.data || { error: 'Erreur interne' };
        return reply.status(status).send(data);
    }
});

//  Débloquer un contenu
fastify.patch('/api/contents/:id/unblock', async (request, reply) => {
    try {
        const token = request.headers.authorization?.replace('Bearer ', '');
        const { id } = request.params as { id: string };

        if (!token) {
            return reply.status(401).send({ error: 'Token manquant' });
        }

        const response = await axios.patch(`${API_URL}/contents/${id}/unblock`, {}, {
            headers: {
                ...defaultHeaders,
                Authorization: `Bearer ${token}`,
            },
        });

        return reply.send(response.data);
    } catch (error: any) {
        console.error(' Erreur PATCH /contents/:id/unblock:', error.response?.status, error.response?.data);
        const status = error.response?.status || 500;
        const data = error.response?.data || { error: 'Erreur interne' };
        return reply.status(status).send(data);
    }
});

//  Archiver un contenu
fastify.patch('/api/contents/:id/archive', async (request, reply) => {
    try {
        const token = request.headers.authorization?.replace('Bearer ', '');
        const { id } = request.params as { id: string };

        if (!token) {
            return reply.status(401).send({ error: 'Token manquant' });
        }

        const response = await axios.patch(`${API_URL}/contents/${id}/archive`, {}, {
            headers: {
                ...defaultHeaders,
                Authorization: `Bearer ${token}`,
            },
        });

        return reply.send(response.data);
    } catch (error: any) {
        console.error(' Erreur PATCH /contents/:id/archive:', error.response?.status, error.response?.data);
        const status = error.response?.status || 500;
        const data = error.response?.data || { error: 'Erreur interne' };
        return reply.status(status).send(data);
    }
});

//  Démarrer le serveur
const PORT = Number(process.env.PORT) || 4000;

fastify.listen({ port: PORT, host: '0.0.0.0' }, (err) => {
    if (err) {
        console.error(err);
        process.exit(1);
    }
    console.log(` Auth service running on http://localhost:${PORT}`);
    console.log(` Login: POST http://localhost:${PORT}/api/auth/login`);
    console.log(` Me: GET http://localhost:${PORT}/api/auth/me`);
});

 */