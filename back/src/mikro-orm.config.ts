import { Options } from '@mikro-orm/core';
import { Categoria } from './entities/Categoria';
import { Producto } from './entities/Producto';
import { Usuario } from './entities/Usuario';
import { Venta } from './entities/Venta';
import { DetalleVenta } from './entities/DetalleVenta';

const config: Options = {
  entities: [Categoria, Producto, Usuario, Venta, DetalleVenta],
  dbName: process.env.DB_NAME || 'negocio',
  user: process.env.DB_USER || 'negocio',
  password: process.env.DB_PASSWORD || 'negocio',
  host: process.env.DB_HOST || 'localhost',
  port: Number(process.env.DB_PORT) || 3306,
  type: 'mysql',
};

export default config;
