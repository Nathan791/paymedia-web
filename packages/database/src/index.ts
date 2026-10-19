import dotenv from 'dotenv';
import path from 'path';
import { Pool } from 'pg';
import { PrismaPg } from '@prisma/adapter-pg';
import { PrismaClient } from '@prisma/client';

// 1. Chargement explicite des variables d'environnement (.env)
dotenv.config(); // Fichier .env du dossier courant
dotenv.config({ path: path.resolve(__dirname, '../../.env') }); // Racine du monorepo (fallback)

const globalForPrisma = globalThis as unknown as {
    prisma: PrismaClient | undefined;
    pgPool: Pool | undefined;
};

// 2. Récupération et vérification de l'URL de connexion
const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
    throw new Error('❌ The DATABASE_URL environment variable is missing or undefined!');
}

// 3. Initialisation du pool PostgreSQL avec connectionString
const pool =
    globalForPrisma.pgPool ??
    new Pool({
        connectionString,
    });

const adapter = new PrismaPg(pool);

// 4. Instanciation du client Prisma 7
export const prisma =
    globalForPrisma.prisma ??
    new PrismaClient({
        adapter,
        log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
    });

if (process.env.NODE_ENV !== 'production') {
    globalForPrisma.prisma = prisma;
    globalForPrisma.pgPool = pool;
}

export * from '@prisma/client';