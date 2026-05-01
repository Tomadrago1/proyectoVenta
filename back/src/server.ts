import express, { Request, Response, NextFunction } from 'express';
import { Server } from 'http';
import path from 'path';
import cors from 'cors';
import session from 'express-session';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import { pool } from './shared/conn';

import { routerProducto } from './routes/producto.routes';
import { routerUsuario } from './routes/usuario.routes';
import { routerVenta } from './routes/venta.routes';
import { routerDetalleVenta } from './routes/detalleVenta.routes';
import { routerCategoria } from './routes/categoria.routes';
import { routerNegocio } from './routes/negocio.routes';
import { routerDetalleVentaGenerico } from './routes/detalleVentaGenerico.routes';
import { routerRol } from './routes/rol.routes';
import { routerBarcode } from './routes/barcode.routes';
import { routerPrinterConfig } from './routes/printerConfig.routes';

const app = express();
const port = Number(process.env.PORT ?? 3000);

// Helmet para cabeceras de seguridad
app.use(helmet());

app.use(express.json());

// Rate limit para el login
const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutos
  max: 10, // Máximo 10 intentos
  message: { message: 'Demasiados intentos de inicio de sesión, intente nuevamente más tarde.' },
  standardHeaders: true,
  legacyHeaders: false,
});

app.use(cors({
  origin: function (origin, callback) {
    // Sin origin = misma máquina o herramienta (Postman, curl, proxy)
    if (!origin) return callback(null, true);

    // Permitir localhost y IPs privadas (192.168.x.x, 10.x.x.x) con http o https
    const allowed = /^https?:\/\/(localhost|127\.0\.0\.1|192\.168\.\d+\.\d+|10\.\d+\.\d+\.\d+)(:\d+)?$/;
    if (allowed.test(origin)) {
      callback(null, true);
    } else {
      callback(new Error('No permitido por CORS'));
    }
  },
}));

app.use(
  session({
    secret: process.env.APP_SECRET || 'default-secret-key',
    resave: false,
    saveUninitialized: false,
    cookie: { secure: false },
  })
);

app.use(express.static(path.join(__dirname, 'dist')));

app.get('/api', (req: Request, res: Response) => {
  res.json({ message: "API funcionando correctamente." });
});

app.use('/api/producto', routerProducto);
app.use('/api/usuario/login', loginLimiter); // Aplicar limite al login
app.use('/api/usuario', routerUsuario);
app.use('/api/venta', routerVenta);
app.use('/api/detalle-venta', routerDetalleVenta);
app.use('/api/categoria', routerCategoria);
app.use('/api/detalle-venta-generico', routerDetalleVentaGenerico);
app.use('/api/negocio', routerNegocio);
app.use('/api/rol', routerRol);
app.use('/api/barcode', routerBarcode);
app.use('/api/printer-config', routerPrinterConfig);

app.get('*', (req: Request, res: Response) => {
  res.sendFile(path.join(__dirname, 'dist', 'index.html'));
});

app.use((err: Error, req: Request, res: Response, next: NextFunction) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Algo salió mal en el servidor' });
});

const setupGracefulShutdown = (server: Server) => {
  let isShuttingDown = false;

  const shutdown = async (signal: string) => {
    if (isShuttingDown) return;
    isShuttingDown = true;

    console.log(`Recibida señal ${signal}. Cerrando servidor...`);

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

  process.on('SIGINT', () => { void shutdown('SIGINT'); });
  process.on('SIGTERM', () => { void shutdown('SIGTERM'); });
};

const bootstrap = async () => {
  try {
    await pool.query('SELECT 1');
    console.log('Conexión a base de datos verificada.');

    const server = app.listen(port, '0.0.0.0', () => {
      console.log(`Servidor Express corriendo en el puerto ${port}`);
      console.log(`- Local: http://localhost:${port}`);
      console.log(`- Red Local: ${process.env.LOCALHOST}:${port}`);
    });

    setupGracefulShutdown(server);
  } catch (error) {
    console.error('No se pudo iniciar el servidor por error de base de datos:', error);
    process.exit(1);
  }
};

void bootstrap();