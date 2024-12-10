import {
  findAll,
  findOne,
  create,
  update,
  remove,
} from '../controllers/venta.controller';
import { Router } from 'express';

export const routerVenta = Router();

// Ruta para obtener todas las ventas
routerVenta.get('/', findAll);

// Ruta para obtener una venta específica por su ID
routerVenta.get('/:id', findOne);

// Ruta para crear una nueva venta
routerVenta.post('/', create);

// Ruta para actualizar una venta existente
routerVenta.put('/:id', update);

// Ruta para eliminar una venta
routerVenta.delete('/:id', remove);
