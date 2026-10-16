"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthService = void 0;
// apps/core/src/services/auth.service.ts
const database_1 = require("@paymedia/database"); // Ajustez le nom selon le package.json de packages/database
const bcrypt_1 = __importDefault(require("bcrypt"));
const ulid_1 = require("ulid");
class AuthService {
    registerUser(data) {
        return __awaiter(this, void 0, void 0, function* () {
            const { username, email, password, countryCode, whatsappPhone } = data;
            // 1. Vérification doublon
            const existingUser = yield database_1.prisma.user.findUnique({ where: { email } });
            if (existingUser) {
                throw new Error('Cet email est déjà utilisé.');
            }
            // 2. Hachage du mot de passe
            const saltRounds = 10;
            const passwordHash = yield bcrypt_1.default.hash(password, saltRounds);
            // 3. Création de l'utilisateur (isVerified: true temporairement avant l'étape OTP)
            const newUser = yield database_1.prisma.user.create({
                data: {
                    ulid: (0, ulid_1.ulid)(),
                    username,
                    email,
                    passwordHash,
                    countryCode,
                    whatsappPhone,
                    //role: 'reader',
                    isVerified: true
                },
                select: { id: true, ulid: true, username: true, email: true, //role: true
                }
            });
            // 4. Création du Portefeuille associé
            yield database_1.prisma.userWallet.create({
                data: {
                    ulid: (0, ulid_1.ulid)(),
                    userId: newUser.id,
                    balance: 0.00,
                    currency: 'XAF'
                }
            });
            return newUser;
        });
    }
    loginUser(data) {
        return __awaiter(this, void 0, void 0, function* () {
            const { email, password } = data;
            const user = yield database_1.prisma.user.findUnique({ where: { email } });
            if (!user || !user.passwordHash || !user.isActive || user.deletedAt) {
                throw new Error('Identifiants invalides ou compte inactif.');
            }
            const isPasswordValid = yield bcrypt_1.default.compare(password, user.passwordHash);
            if (!isPasswordValid) {
                throw new Error('Identifiants invalides.');
            }
            const sessionJti = (0, ulid_1.ulid)();
            const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000);
            // Création de la session en base de données
            yield database_1.prisma.session.create({
                data: {
                    ulid: (0, ulid_1.ulid)(),
                    userId: user.id,
                    jti: sessionJti,
                    tokenType: 'ACCESS',
                    expiresAt
                }
            });
            // Mise à jour de la dernière connexion
            yield database_1.prisma.user.update({
                where: { id: user.id },
                data: { lastLoginAt: new Date() }
            });
            return { user, sessionJti };
        });
    }
}
exports.AuthService = AuthService;
