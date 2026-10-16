import 'dotenv/config';
import dotenv from 'dotenv';
import { prisma } from '@paymedia/database';
import bcrypt from 'bcryptjs';


dotenv.config();

function generateUlid(): string {
    const timestamp = Date.now().toString(36).padStart(10, '0');
    const random = Math.random().toString(36).substring(2, 18).padEnd(16, '0');
    return (timestamp + random).toUpperCase();
}

async function createAdmin() {
    const email = 'admin@paymedia.com';
    const password = 'Admin123!';
    const username = 'SuperAdmin';
    const whatsappPhone = '+237600000001';
    const countryCode = 'CM';

    try {
        console.log(' Vérification de la connexion...');
        await prisma.$connect();
        console.log('Connexion à la base réussie !');

        const existingUser = await prisma.user.findUnique({
            where: { email }
        });

        if (existingUser) {
            console.log(`L'administrateur existe déjà (ID: ${existingUser.id})`);
            return;
        }

        const passwordHash = await bcrypt.hash(password, 10);

        const user = await prisma.user.create({
            data: {
                ulid: generateUlid(),
                username,
                email,
                passwordHash,
                whatsappPhone,
                countryCode,
                role: 'admin',
                isVerified: true,
                isActive: true,
                wallet: {
                    create: {
                        ulid: generateUlid(),
                        balance: 0,
                        currency: 'XAF'
                    }
                }
            },
            include: { wallet: true }
        });

        console.log(' Administrateur créé avec succès !');
        console.log(`   ID: ${user.id}`);
        console.log(`   Email: ${user.email}`);
        console.log(`   Rôle: ${user.role}`);
        console.log(`   Wallet ID: ${user.wallet?.id}`);
        console.log(`   Mot de passe: ${password}`);
    } catch (error) {
        console.error(' Erreur:', error);
        process.exit(1);
    }

    process.exit(0);
}

createAdmin();