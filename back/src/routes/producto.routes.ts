import {
  findAll,
  findOne,
  create,
  update,
  remove,
  findByBarcode,
  findByName,
  updateStock,
  getProductoGenerico,
} from '../controllers/producto.controller';
import { Router } from 'express';

export const routerProducto = Router();

routerProducto.get('/generico', getProductoGenerico);

routerProducto.put('/stock/:id/:stock', updateStock);

routerProducto.get('/', findAll);

routerProducto.get('/:id', findOne);

routerProducto.post('/', create);

routerProducto.put('/:id', update);

routerProducto.delete('/:id', remove);

routerProducto.get('/barcode/:barcode', findByBarcode);

routerProducto.get('/search/:name', findByName);