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
const fastify_1 = __importDefault(require("fastify"));
const autoload_1 = __importDefault(require("@fastify/autoload"));
const cors_1 = __importDefault(require("@fastify/cors"));
const path_1 = require("path");
const start = () => __awaiter(void 0, void 0, void 0, function* () {
    const fastify = (0, fastify_1.default)({ logger: true });
    // 1. Enregistrer CORS
    yield fastify.register(cors_1.default, { origin: '*' });
    // 2. Enregistrer automatiquement nos plugins personnalisés (Prisma, etc.)
    yield fastify.register(autoload_1.default, {
        dir: (0, path_1.join)(__dirname, 'plugins')
    });
    // 3. Enregistrer automatiquement nos routes
    yield fastify.register(autoload_1.default, {
        dir: (0, path_1.join)(__dirname, 'routes'),
        routeParams: true
    });
    try {
        const port = Number(process.env.PORT) || 4000;
        yield fastify.listen({ port: 4000, host: '127.0.0.1' });
        console.log(`🚀 API disponible sur http://localhost:${port}`);
    }
    catch (err) {
        fastify.log.error(err);
        process.exit(1);
    }
});
start();
