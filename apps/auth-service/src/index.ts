
// apps/auth-service/src/index.ts
import Fastify from 'fastify';
import cors from '@fastify/cors';
import dotenv from 'dotenv';
import { corsOptions } from './config/cors';
import { authRoutes } from './routes/auth.routes';
import { usersRoutes } from './routes/users.routes';
import { contentsRoutes } from './routes/contents.routes';
import multipart from '@fastify/multipart';

dotenv.config();

const fastify = Fastify({
    logger: true,
    bodyLimit: 104857600,
});

fastify.register(multipart, {
    limits: {
        fileSize: 100 * 1024 * 1024,
        files: 5,
    },
});

//  CORS
fastify.register(cors, corsOptions);

//  ROUTES
fastify.register(authRoutes);
fastify.register(usersRoutes);
fastify.register(contentsRoutes);

//  HEALTH
fastify.get('/api/health', async () => {
    return { status: 'ok', timestamp: new Date().toISOString() };
});

const PORT = Number(process.env.PORT) || 4000;

fastify.listen({ port: PORT, host: '0.0.0.0' }, (err) => {
    if (err) {
        console.error(err);
        process.exit(1);
    }
    console.log(` Auth service running on http://localhost:${PORT}`);
});




