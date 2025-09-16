import mysql from 'mysql2/promise';

export const pool = mysql.createPool({
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
