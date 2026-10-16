import { FastifyInstance } from 'fastify';
import axios from 'axios';
import FormData from 'form-data';

const CATALOG_API_URL =
    process.env.CATALOG_API_URL ||
    'http://192.168.100.101:8000/api/v1/catalog';

const MAX_BODY_LENGTH = 100 * 1024 * 1024;
const REQUEST_TIMEOUT = 120000;

function getToken(request: any): string | null {
    const authorization = request.headers.authorization;

    if (!authorization) {
        return null;
    }

    return authorization.replace(/^Bearer\s+/i, '');
}

function getHeaders(token: string) {
    return {
        Authorization: `Bearer ${token}`,
        'x-app-origin': 'web_editor',
    };
}

function handleError(error: any, reply: any) {
    const status = error.response?.status || 500;
    const data = error.response?.data || {
        message: error.message || 'Erreur interne',
    };

    return reply.status(status).send(data);
}

export async function contentsRoutes(fastify: FastifyInstance) {
    fastify.get('/api/categories', async (request, reply) => {
        try {
            const token = getToken(request);

            if (!token) {
                return reply.status(401).send({
                    message: 'Token manquant',
                });
            }

            const response = await axios.get(
                `${CATALOG_API_URL}/categories`,
                {
                    headers: getHeaders(token),
                    timeout: 30000,
                }
            );

            return reply.send(response.data);
        } catch (error) {
            return handleError(error, reply);
        }
    });

    fastify.get('/api/content', async (request, reply) => {
        try {
            const token = getToken(request);

            if (!token) {
                return reply.status(401).send({
                    message: 'Token manquant',
                });
            }

            const response = await axios.get(
                `${CATALOG_API_URL}/content`,
                {
                    headers: getHeaders(token),
                    timeout: 30000,
                }
            );

            return reply.send(response.data);
        } catch (error) {
            return handleError(error, reply);
        }
    });

    fastify.get('/api/content/my-contents', async (request, reply) => {
        try {
            const token = getToken(request);

            if (!token) {
                return reply.status(401).send({
                    message: 'Token manquant',
                });
            }

            const response = await axios.get(
                `${CATALOG_API_URL}/my-contents`,
                {
                    headers: getHeaders(token),
                    timeout: 30000,
                }
            );

            return reply.send(response.data);
        } catch (error) {
            return handleError(error, reply);
        }
    });

    fastify.get('/api/content/pending', async (request, reply) => {
        try {
            const token = getToken(request);

            if (!token) {
                return reply.status(401).send({
                    message: 'Token manquant',
                });
            }

            const response = await axios.get(
                `${CATALOG_API_URL}/pending`,
                {
                    headers: getHeaders(token),
                    timeout: 30000,
                }
            );

            return reply.send(response.data);
        } catch (error) {
            return handleError(error, reply);
        }
    });

    fastify.get('/api/content/:ulid', async (request, reply) => {
        try {
            const token = getToken(request);

            if (!token) {
                return reply.status(401).send({
                    message: 'Token manquant',
                });
            }

            const { ulid } = request.params as { ulid: string };

            const response = await axios.get(
                `${CATALOG_API_URL}/content/${ulid}`,
                {
                    headers: getHeaders(token),
                    timeout: 30000,
                }
            );

            return reply.send(response.data);
        } catch (error) {
            return handleError(error, reply);
        }
    });

    fastify.post('/api/content', async (request, reply) => {
        try {
            const token = getToken(request);

            if (!token) {
                return reply.status(401).send({
                    message: 'Token manquant',
                });
            }

            const response = await axios.post(
                `${CATALOG_API_URL}/content`,
                request.body,
                {
                    headers: {
                        ...getHeaders(token),
                        'Content-Type':
                            request.headers['content-type'] ||
                            'application/json',
                    },
                    maxBodyLength: MAX_BODY_LENGTH,
                    maxContentLength: MAX_BODY_LENGTH,
                    timeout: REQUEST_TIMEOUT,
                }
            );

            return reply.send(response.data);
        } catch (error) {
            return handleError(error, reply);
        }
    });

    fastify.put('/api/content/:ulid', async (request, reply) => {
        try {
            const token = getToken(request);

            if (!token) {
                return reply.status(401).send({
                    message: 'Token manquant',
                });
            }

            const { ulid } = request.params as { ulid: string };

            const response = await axios.put(
                `${CATALOG_API_URL}/content/${ulid}`,
                request.body,
                {
                    headers: {
                        ...getHeaders(token),
                        'Content-Type':
                            request.headers['content-type'] ||
                            'application/json',
                    },
                    maxBodyLength: MAX_BODY_LENGTH,
                    maxContentLength: MAX_BODY_LENGTH,
                    timeout: REQUEST_TIMEOUT,
                }
            );

            return reply.send(response.data);
        } catch (error) {
            return handleError(error, reply);
        }
    });

    fastify.post('/api/content/:ulid/cover', async (request, reply) => {
        try {
            const token = getToken(request);

            if (!token) {
                return reply.status(401).send({
                    message: 'Token manquant',
                });
            }

            const response = await axios.post(
                `${CATALOG_API_URL}/content/${(request.params as { ulid: string }).ulid}/cover`,
                request.body,
                {
                    headers: {
                        ...getHeaders(token),
                        'Content-Type':
                            request.headers['content-type'] ||
                            'application/octet-stream',
                    },
                    maxBodyLength: MAX_BODY_LENGTH,
                    maxContentLength: MAX_BODY_LENGTH,
                    timeout: REQUEST_TIMEOUT,
                }
            );

            return reply.send(response.data);
        } catch (error) {
            return handleError(error, reply);
        }
    });

    fastify.delete('/api/content/:ulid', async (request, reply) => {
        try {
            const token = getToken(request);

            if (!token) {
                return reply.status(401).send({
                    message: 'Token manquant',
                });
            }

            const { ulid } = request.params as { ulid: string };

            const response = await axios.delete(
                `${CATALOG_API_URL}/content/${ulid}`,
                {
                    headers: getHeaders(token),
                    timeout: 30000,
                }
            );

            return reply.send(response.data);
        } catch (error) {
            return handleError(error, reply);
        }
    });

    fastify.patch('/api/content/:ulid/submit', async (request, reply) => {
        try {
            const token = getToken(request);

            if (!token) {
                return reply.status(401).send({
                    message: 'Token manquant',
                });
            }

            const { ulid } = request.params as { ulid: string };

            const response = await axios.patch(
                `${CATALOG_API_URL}/${ulid}/submit`,
                request.body || {},
                {
                    headers: getHeaders(token),
                    timeout: 30000,
                }
            );

            return reply.send(response.data);
        } catch (error) {
            return handleError(error, reply);
        }
    });

    fastify.patch('/api/content/:ulid/publish', async (request, reply) => {
        try {
            const token = getToken(request);

            if (!token) {
                return reply.status(401).send({
                    message: 'Token manquant',
                });
            }

            const { ulid } = request.params as { ulid: string };

            const response = await axios.patch(
                `${CATALOG_API_URL}/${ulid}/publish`,
                request.body || {},
                {
                    headers: getHeaders(token),
                    timeout: 30000,
                }
            );

            return reply.send(response.data);
        } catch (error) {
            return handleError(error, reply);
        }
    });

    fastify.patch('/api/content/:ulid/archive', async (request, reply) => {
        try {
            const token = getToken(request);

            if (!token) {
                return reply.status(401).send({
                    message: 'Token manquant',
                });
            }

            const { ulid } = request.params as { ulid: string };

            const response = await axios.patch(
                `${CATALOG_API_URL}/${ulid}/archive`,
                request.body || {},
                {
                    headers: getHeaders(token),
                    timeout: 30000,
                }
            );

            return reply.send(response.data);
        } catch (error) {
            return handleError(error, reply);
        }
    });

    fastify.patch('/api/content/:ulid/reject', async (request, reply) => {
        try {
            const token = getToken(request);

            if (!token) {
                return reply.status(401).send({
                    message: 'Token manquant',
                });
            }

            const { ulid } = request.params as { ulid: string };

            const response = await axios.patch(
                `${CATALOG_API_URL}/${ulid}/reject`,
                request.body || {},
                {
                    headers: getHeaders(token),
                    timeout: 30000,
                }
            );

            return reply.send(response.data);
        } catch (error) {
            return handleError(error, reply);
        }
    });
}















































// apps/auth-service/src/routes/contents.routes.ts
/*import { FastifyInstance } from 'fastify';
import axios from 'axios';

const CATALOG_API_URL = process.env.CATALOG_API_URL || 'http://192.168.100.101:8000/api/v1/catalog';

export async function contentsRoutes(fastify: FastifyInstance) {
    console.log('🔵 ENREGISTREMENT DES ROUTES CONTENTS');

    // GET /api/categories
    fastify.get('/api/categories', async (request, reply) => {
        try {
            const token = request.headers.authorization?.replace('Bearer ', '');
            if (!token) {
                return reply.status(401).send({ error: 'Token manquant' });
            }

            const response = await axios.get(`${CATALOG_API_URL}/categories`, {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'x-app-origin': 'web_editor',
                },
                timeout: 30000,
            });

            return reply.send(response.data);
        } catch (error: any) {
            console.error('🔴 GET /categories error:', error.message);
            return reply.status(error.response?.status || 500).send({
                error: error.response?.data || { message: error.message }
            });
        }
    });

    // GET /api/content (liste)
    fastify.get('/api/content', async (request, reply) => {
        try {
            const token = request.headers.authorization?.replace('Bearer ', '');
            if (!token) {
                return reply.status(401).send({ error: 'Token manquant' });
            }

            const response = await axios.get(`${CATALOG_API_URL}/content`, {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'x-app-origin': 'web_editor',
                },
                timeout: 30000,
            });

            return reply.send(response.data);
        } catch (error: any) {
            console.error('🔴 GET /content error:', error.message);
            return reply.status(error.response?.status || 500).send({
                error: error.response?.data || { message: error.message }
            });
        }
    });

    // GET /api/content/:ulid (détail)
    fastify.get('/api/content/:ulid', async (request, reply) => {
        try {
            const token = request.headers.authorization?.replace('Bearer ', '');
            if (!token) {
                return reply.status(401).send({ error: 'Token manquant' });
            }

            const { ulid } = request.params as { ulid: string };
            console.log(`🔵 PROXY - GET /content/${ulid}`);

            const response = await axios.get(`${CATALOG_API_URL}/content/${ulid}`, {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'x-app-origin': 'web_editor',
                },
                timeout: 30000,
            });

            console.log(`🟢 PROXY - GET /content/${ulid} - Status: ${response.status}`);
            return reply.send(response.data);
        } catch (error: any) {
            console.error('🔴 GET /content/:ulid error:', error.message);
            return reply.status(error.response?.status || 500).send({
                error: error.response?.data || { message: error.message }
            });
        }
    });

    // PUT /api/content/:ulid (modification)
    fastify.put('/api/content/:ulid', async (request, reply) => {
        try {
            const token = request.headers.authorization?.replace('Bearer ', '');
            if (!token) {
                return reply.status(401).send({ error: 'Token manquant' });
            }

            const { ulid } = request.params as { ulid: string };
            console.log(`🔵 PROXY - PUT /content/${ulid}`);

            const response = await axios.put(
                `${CATALOG_API_URL}/content/${ulid}`,
                request.body,
                {
                    headers: {
                        'Authorization': `Bearer ${token}`,
                        'x-app-origin': 'web_editor',
                        'Content-Type': 'multipart/form-data',
                    },
                    maxBodyLength: 100 * 1024 * 1024,
                    maxContentLength: 100 * 1024 * 1024,
                    timeout: 120000,
                }
            );

            console.log(`🟢 PROXY - PUT /content/${ulid} - Status: ${response.status}`);
            return reply.send(response.data);
        } catch (error: any) {
            console.error('🔴 PUT /content/:ulid error:', error.message);
            return reply.status(error.response?.status || 500).send({
                error: error.response?.data || { message: error.message }
            });
        }
    });

    // DELETE /api/content/:ulid
    fastify.delete('/api/content/:ulid', async (request, reply) => {
        try {
            const token = request.headers.authorization?.replace('Bearer ', '');
            if (!token) {
                return reply.status(401).send({ error: 'Token manquant' });
            }

            const { ulid } = request.params as { ulid: string };
            console.log(`🔵 PROXY - DELETE /content/${ulid}`);

            const response = await axios.delete(`${CATALOG_API_URL}/content/${ulid}`, {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'x-app-origin': 'web_editor',
                },
                timeout: 30000,
            });

            console.log(`🟢 PROXY - DELETE /content/${ulid} - Status: ${response.status}`);
            return reply.send(response.data);
        } catch (error: any) {
            console.error('🔴 DELETE /content/:ulid error:', error.message);
            return reply.status(error.response?.status || 500).send({
                error: error.response?.data || { message: error.message }
            });
        }
    });

    // PATCH /api/content/:ulid/status
    fastify.patch('/api/content/:ulid/status', async (request, reply) => {
        try {
            const token = request.headers.authorization?.replace('Bearer ', '');
            if (!token) {
                return reply.status(401).send({ error: 'Token manquant' });
            }

            const { ulid } = request.params as { ulid: string };
            const { status } = request.body as { status: string };
            console.log(`🔵 PROXY - PATCH /content/${ulid}/status -> ${status}`);

            const response = await axios.patch(
                `${CATALOG_API_URL}/content/${ulid}/status`,
                { status },
                {
                    headers: {
                        'Authorization': `Bearer ${token}`,
                        'x-app-origin': 'web_editor',
                    },
                    timeout: 30000,
                }
            );

            console.log(`🟢 PROXY - PATCH /content/${ulid}/status - Status: ${response.status}`);
            return reply.send(response.data);
        } catch (error: any) {
            console.error('🔴 PATCH /content/:ulid/status error:', error.message);
            return reply.status(error.response?.status || 500).send({
                error: error.response?.data || { message: error.message }
            });
        }
    });

    // POST /api/content (création)
    fastify.post('/api/content', async (request, reply) => {
        try {
            const token = request.headers.authorization?.replace('Bearer ', '');
            if (!token) {
                return reply.status(401).send({ error: 'Token manquant' });
            }

            console.log('🔵 PROXY - POST /content');

            const response = await axios.post(
                `${CATALOG_API_URL}/content`,
                request.body,
                {
                    headers: {
                        'Authorization': `Bearer ${token}`,
                        'x-app-origin': 'web_editor',
                        'Content-Type': 'multipart/form-data',
                    },
                    maxBodyLength: 100 * 1024 * 1024,
                    maxContentLength: 100 * 1024 * 1024,
                    timeout: 120000,
                }
            );

            console.log(`🟢 PROXY - POST /content - Status: ${response.status}`);
            return reply.send(response.data);
        } catch (error: any) {
            console.error('🔴 POST /content error:', error.message);
            return reply.status(error.response?.status || 500).send({
                error: error.response?.data || { message: error.message }
            });
        }
    });
}

 */