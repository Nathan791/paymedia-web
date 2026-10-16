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
const fastify_plugin_1 = __importDefault(require("fastify-plugin"));
const jwt_1 = __importDefault(require("@fastify/jwt"));
const authPlugin = (fastify) => __awaiter(void 0, void 0, void 0, function* () {
    yield fastify.register(jwt_1.default, {
        secret: process.env.JWT_SECRET || 'un-secret-tres-robuste-de-dev-123456!'
    });
    // Décorateur global pour protéger les routes privées
    fastify.decorate('authenticate', (request, reply) => __awaiter(void 0, void 0, void 0, function* () {
        try {
            yield request.jwtVerify();
        }
        catch (err) {
            return reply.status(401).send({ error: 'Non autorisé. Token invalide ou expiré.' });
        }
    }));
});
exports.default = (0, fastify_plugin_1.default)(authPlugin);
