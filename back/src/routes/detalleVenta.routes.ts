import {
  findAll,
  findOne,
  create,
  update,
  remove,
} from '../controllers/detalleVenta.controller';
import { Router } from 'express';

export const routerDetalleVenta = Router();

routerDetalleVenta.get('/', findAll);

routerDetalleVenta.get('/:id_venta/:id_producto', findOne);

routerDetalleVenta.post('/', create);

routerDetalleVenta.put('/:id_venta/:id_producto', update);

routerDetalleVenta.delete('/:id_venta/:id_producto', remove);
