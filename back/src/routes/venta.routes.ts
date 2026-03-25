import {
  findAll,
  findOne,
  create,
  update,
  remove,
  filterByDateRange,
} from '../controllers/venta.controller';
import { Router } from 'express';
import { validateJWT } from '../utils/validateJwt';

export const routerVenta = Router();

routerVenta.use(validateJWT);

routerVenta.get('/filtro/fechas', filterByDateRange);

routerVenta.get('/', findAll);

routerVenta.get('/:id', findOne);

routerVenta.post('/', create);

routerVenta.put('/:id', update);

routerVenta.delete('/:id', remove);
