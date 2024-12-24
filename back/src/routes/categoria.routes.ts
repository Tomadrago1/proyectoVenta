import {
  findAll,
  findOne,
  create,
  update,
  remove,
  findByName,
} from '../controllers/categoria.controller';
import { Router } from 'express';

export const routerCategoria = Router();

routerCategoria.get('/', findAll);

routerCategoria.get('/:id', findOne);

routerCategoria.post('/', create);

routerCategoria.put('/:id', update);

routerCategoria.delete('/:id', remove);

routerCategoria.get('/search/:name', findByName);