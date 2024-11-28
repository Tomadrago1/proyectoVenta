import {
  findAll,
  findOne,
  create,
  update,
  remove,
  login,
} from '../controllers/usuario.controller'; // Asegúrate de tener este controlador
import { Router } from 'express';

export const routerUsuario = Router();

// Ruta para obtener todos los usuarios
routerUsuario.get('/', findAll);

// Ruta para obtener un usuario específico por su ID
routerUsuario.get('/:id', findOne);

// Ruta para crear un nuevo usuario
routerUsuario.post('/', create);

// Ruta para actualizar un usuario existente
routerUsuario.put('/:id', update);

// Ruta para eliminar un usuario
routerUsuario.delete('/:id', remove);

routerUsuario.post('/login', login);