import {
  findAll,
  findOne,
  findByVenta,
  create,
  update,
  remove,
} from '../controllers/detalleVenta.controller';
import { Router } from 'express';
import { validateJWT } from '../utils/validateJwt';

export const routerDetalleVenta = Router();

routerDetalleVenta.use(validateJWT);

routerDetalleVenta.get('/', findAll);

routerDetalleVenta.get('/:id_venta/:id_producto', findOne);

routerDetalleVenta.get('/:id_venta/', findByVenta);

routerDetalleVenta.post('/', create);

routerDetalleVenta.put('/:id_venta/:id_producto', update);

routerDetalleVenta.delete('/:id_venta/:id_producto', remove);
