import {
  findAll,
  findOne,
  create,
  update,
  remove,
} from '../controllers/producto.controller';
import { Router } from 'express';

export const routerProducto = Router();

// Ruta para obtener todos los productos
routerProducto.get('/', findAll);

// Ruta para obtener un producto específico por su ID
routerProducto.get('/:id', findOne);

// Ruta para crear un nuevo producto
routerProducto.post('/', create);

// Ruta para actualizar un producto existente
routerProducto.put('/:id', update);

// Ruta para eliminar un producto
routerProducto.delete('/:id', remove);
