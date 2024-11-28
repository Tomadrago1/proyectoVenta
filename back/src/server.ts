import express, { Request, Response } from 'express';
import path from 'path';
import cors from 'cors';
import session from 'express-session';

const app = express();
const port = 3000;


app.use(express.json());

app.use(cors({
  origin: 'http://localhost:8080'
}));

import { routerProducto } from './routes/producto.routes';
import { routerUsuario } from './routes/usuario.routes';

app.use(
  session({
    secret: 'juamaqbrujan', // Cambia esta clave por una más segura en producción
    resave: false,
    saveUninitialized: false,
    cookie: { secure: false }, // Cambiar a true si usas HTTPS
  })
);

app.use('/api/producto', routerProducto);
app.use('/api/usuario', routerUsuario);

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


app.listen(port, () => {
  console.log(`Servidor Express corriendo en http://localhost:${port}`);
});
