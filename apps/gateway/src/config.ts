import 'dotenv/config';

export const config = {
    host: process.env.GATEWAY_HOST || '0.0.0.0',

    port: Number(
        process.env.GATEWAY_PORT || 8000
    ),

    jwtSecret:
        process.env.JWT_SECRET ||
        'paymedia-development-secret',

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