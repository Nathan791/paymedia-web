import { JWTPayload } from './jwt';

declare module 'fastify' {
    interface FastifyRequest {
        // Rend l'objet user accessible sur toutes les requêtes après authentification
        user?: JWTPayload;
    }
}