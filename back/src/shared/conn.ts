import dotenv from 'dotenv';
import mysql from 'mysql2/promise';

const nodeEnv = process.env.NODE_ENV ?? 'production';

dotenv.config();
dotenv.config({ path: `.env.${nodeEnv}`, override: true });

const getRequiredEnv = (name: string): string => {
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

export const pool = mysql.createPool({
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
