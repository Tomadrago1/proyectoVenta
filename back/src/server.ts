import express, { Request, Response } from 'express';
import path from 'path';
import cors from 'cors';
import session from 'express-session';
import { MikroORM } from '@mikro-orm/mysql';
import mikroConfig from './mikro-orm.config';


// Primer servidor (en el puerto 3000)
const app = express();
const port = 3000;

app.use(express.json()); // Middleware para manejar JSON

app.use(cors({
  origin: 'http://localhost:8080',
}));

// Rutas (estos imports pueden estar en sus respectivos archivos)
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

async function start() {
  await MikroORM.init(mikroConfig);
  app.listen(port, () => {
    console.log(`Servidor Express corriendo en http://localhost:${port}`);
  });
}

start().catch((err) => {
  console.error('Error iniciando la aplicaci\u00f3n', err);
});
