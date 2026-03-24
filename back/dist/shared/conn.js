"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.pool = void 0;
const dotenv_1 = __importDefault(require("dotenv"));
const promise_1 = __importDefault(require("mysql2/promise"));
const nodeEnv = process.env.NODE_ENV ?? 'production';
// Carga .env por defecto y luego sobreescribe con .env.{entorno} si existe.
dotenv_1.default.config();
dotenv_1.default.config({ path: `.env.${nodeEnv}`, override: true });
const getRequiredEnv = (name) => {
    const value = process.env[name];
    if (!value) {
        throw new Error(`Falta la variable de entorno requerida: ${name}`);
    }
    return value;
};
const dbPort = Number(process.env.DB_PORT ?? '3306');
if (Number.isNaN(dbPort)) {
    throw new Error('La variable DB_PORT debe ser un numero valido');
}
exports.pool = promise_1.default.createPool({
    host: getRequiredEnv('DB_HOST'),
    port: dbPort,
    user: getRequiredEnv('DB_USER'),
    password: getRequiredEnv('DB_PASSWORD'),
    database: getRequiredEnv('DB_NAME'),
    waitForConnections: true,
    connectionLimit: 10,
    maxIdle: 10,
    idleTimeout: 60000,
    queueLimit: 0,
    enableKeepAlive: true,
    keepAliveInitialDelay: 0,
});
