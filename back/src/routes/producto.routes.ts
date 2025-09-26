import {
  findAll,
  findOne,
  create,
  update,
  remove,
  findByBarcode,
  findByName,
  updateStock,
  decrementStock,
} from '../controllers/producto.controller';
import { Router } from 'express';

export const routerProducto = Router();

routerProducto.put('/stock/:id/:stock', updateStock);

routerProducto.get('/', findAll);

routerProducto.get('/:id', findOne);

routerProducto.put('/decrement-stock/:id/:cantidad', decrementStock);

routerProducto.post('/', create);

routerProducto.put('/:id', update);

routerProducto.delete('/:id', remove);

routerProducto.get('/barcode/:barcode', findByBarcode);

routerProducto.get('/search/:name', findByName);