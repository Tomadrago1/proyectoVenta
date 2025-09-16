"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.pool = void 0;
const promise_1 = __importDefault(require("mysql2/promise"));
exports.pool = promise_1.default.createPool({
    host: 'b1c1nnrckvmjvoqmnv3s-mysql.services.clever-cloud.com',
    port: 3306,
    user: 'ucshzilrupyqbyok',
    password: 'BmVhhA204lLIrPnCZFUg',
    database: 'b1c1nnrckvmjvoqmnv3s',
    waitForConnections: true,
    connectionLimit: 10,
    maxIdle: 10,
    idleTimeout: 60000,
    queueLimit: 0,
    enableKeepAlive: true,
    keepAliveInitialDelay: 0
});
