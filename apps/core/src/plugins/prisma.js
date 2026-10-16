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
const database_1 = require("@paymedia/database");
const prismaPlugin = (fastify) => __awaiter(void 0, void 0, void 0, function* () {
    fastify.decorate('db', database_1.prisma);
    // Fermeture propre de la connexion à la fermeture de l'API
    fastify.addHook('onClose', (server) => __awaiter(void 0, void 0, void 0, function* () {
        yield server.db.$disconnect();
    }));
});
exports.default = (0, fastify_plugin_1.default)(prismaPlugin);
