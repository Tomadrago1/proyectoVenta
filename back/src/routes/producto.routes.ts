import {
  findAll,
  findOne,
  create,
  update,
  remove,
  findByBarcode,
} from '../controllers/producto.controller';
import { Router } from 'express';

export const routerProducto = Router();

routerProducto.get('/', findAll);

routerProducto.get('/:id', findOne);

routerProducto.post('/', create);

routerProducto.put('/:id', update);

routerProducto.delete('/:id', remove);

routerProducto.get('/barcode/:barcode', findByBarcode);
