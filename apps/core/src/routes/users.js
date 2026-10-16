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
Object.defineProperty(exports, "__esModule", { value: true });
const userRoutes = (fastify) => __awaiter(void 0, void 0, void 0, function* () {
    fastify.addHook('onRequest', fastify.authenticate);
    // Exemple : Récupérer tous les utilisateurs
    fastify.get('/', (request, reply) => __awaiter(void 0, void 0, void 0, function* () {
        const users = yield fastify.db.user.findMany({
            select: { id: true, ulid: true, username: true, email: true, role: true }
        });
        return users;
    }));
    // Exemple : Récupérer le solde du portefeuille d'un utilisateur
    fastify.get('/:id/wallet', (request, reply) => __awaiter(void 0, void 0, void 0, function* () {
        const { id } = request.params;
        const wallet = yield fastify.db.userWallet.findUnique({
            where: { userId: id }
        });
        if (!wallet) {
            return reply.status(404).send({ error: 'Portefeuille introuvable' });
        }
        return wallet;
    }));
});
exports.default = userRoutes;
