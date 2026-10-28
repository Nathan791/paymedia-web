import 'dotenv/config';

const jwtSecret = process.env.JWT_ACCESS_SECRET;

if (!jwtSecret) {
    throw new Error(
        'Missing required environment variable: JWT_ACCESS_SECRET. ' +
        'Set the same access-token secret for the gateway and catalog service.',
    );
}

export const config = {
    host: process.env.GATEWAY_HOST || '0.0.0.0',

    port: Number(
        process.env.GATEWAY_PORT || 8000
    ),

    // Must match apps/content's JWT_ACCESS_SECRET exactly.
    // No development fallback: a fallback can silently invalidate tokens
    // or make the gateway accept tokens signed with a predictable secret.
    jwtSecret,

    authServiceUrl:
        process.env.AUTH_SERVICE_URL ||
        'http://localhost:4000',

    catalogServiceUrl:
        process.env.CATALOG_SERVICE_URL ||
        'http://localhost:4001',

    coreServiceUrl:
        process.env.CORE_SERVICE_URL ||
        'http://localhost:4002',
};
