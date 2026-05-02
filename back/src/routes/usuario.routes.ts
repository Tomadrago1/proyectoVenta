import {
  findAll,
  findOne,
  create,
  update,
  remove,
  login,
  me,
  logout
} from '../controllers/usuario.controller';
import { Router } from 'express';
import { validateJWT } from '../utils/validateJwt';
import { requireRole } from '../utils/requireRole';

export const routerUsuario = Router();

// Login queda público
routerUsuario.post('/login', login);
routerUsuario.post('/logout', logout);

// Todas las rutas debajo requieren JWT válido
routerUsuario.use(validateJWT);

routerUsuario.get('/me', me);

// Ruta para obtener todos los usuarios
routerUsuario.get('/', findAll);

// Ruta para obtener un usuario específico por su ID
routerUsuario.get('/:id', findOne);

// Ruta para crear un nuevo usuario (solo Admin o Superadmin)
routerUsuario.post('/', requireRole('Administrador', 'Superadmin'), create);

// Ruta para actualizar un usuario existente (solo Admin o Superadmin)
routerUsuario.put('/:id', requireRole('Administrador', 'Superadmin'), update);

// Ruta para eliminar un usuario (solo Admin o Superadmin)
routerUsuario.delete('/:id', requireRole('Administrador', 'Superadmin'), remove);