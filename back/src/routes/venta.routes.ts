import {
  findAll,
  findOne,
  create,
  update,
  remove,
  filterByDateRange,
} from '../controllers/venta.controller';
import { Router } from 'express';

export const routerVenta = Router();

routerVenta.get('/filtro/fechas', filterByDateRange);

routerVenta.get('/', findAll);

routerVenta.get('/:id', findOne);

routerVenta.post('/', create);

routerVenta.put('/:id', update);

routerVenta.delete('/:id', remove);
