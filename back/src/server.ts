import express, { Request, Response } from 'express';
import { Server } from 'http';
import path from 'path';
import cors from 'cors';
import session from 'express-session';
import { pool } from './shared/conn';

const app = express();
const port = Number(process.env.PORT ?? 3000);

app.use(express.json());

app.use(cors({
  origin: 'http://localhost:8080',
}));

import { routerProducto } from './routes/producto.routes';
import { routerUsuario } from './routes/usuario.routes';
import { routerVenta } from './routes/venta.routes';
import { routerDetalleVenta } from './routes/detalleVenta.routes';
import { routerCategoria } from './routes/categoria.routes';
import { routerImpresora } from './routes/impresora.routes';

app.use(
  session({
    secret: 'juamaqbrujan',
    resave: false,
    saveUninitialized: false,
    cookie: { secure: false },
  })
);

app.use('/api/producto', routerProducto);
app.use('/api/usuario', routerUsuario);
app.use('/api/venta', routerVenta);
app.use('/api/detalle-venta', routerDetalleVenta);
app.use('/api/categoria', routerCategoria);
app.use('/api/impresora', routerImpresora);

app.use(express.static(path.join(__dirname, 'dist')));

app.get('/', (req: Request, res: Response) => {
  res.send('¡Hola Mundo! El servidor Express está corriendo en el puerto 3000.');
});

app.get('/api', (req: Request, res: Response) => {
  res.json({ message: "API funcionando correctamente." });
});

app.get('/home', (req: Request, res: Response) => {
  res.sendFile(path.join(__dirname, 'dist', 'index.html'));
});

const setupGracefulShutdown = (server: Server) => {
  let isShuttingDown = false;

  const shutdown = async (signal: string) => {
    if (isShuttingDown) return;
    isShuttingDown = true;

    console.log(`Recibida senal ${signal}. Cerrando servidor...`);

    server.close(async () => {
      try {
        await pool.end();
        console.log('Pool de MySQL cerrado correctamente.');
        process.exit(0);
      } catch (error) {
        console.error('Error cerrando el pool de MySQL:', error);
        process.exit(1);
      }
    });

    setTimeout(() => {
      console.error('Cierre forzado por timeout.');
      process.exit(1);
    }, 10000).unref();
  };

  process.on('SIGINT', () => {
    void shutdown('SIGINT');
  });

  process.on('SIGTERM', () => {
    void shutdown('SIGTERM');
  });
};

const bootstrap = async () => {
  try {
    await pool.query('SELECT 1');
    console.log('Conexion a base de datos verificada.');

    const server = app.listen(port, () => {
      console.log(`Servidor Express corriendo en http://localhost:${port}`);
    });

    setupGracefulShutdown(server);
  } catch (error) {
    console.error('No se pudo iniciar el servidor por error de base de datos:', error);
    process.exit(1);
  }
};

void bootstrap();
