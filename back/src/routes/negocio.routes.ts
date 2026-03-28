import { Router } from 'express';
import { findAll, findOne, create, update, remove } from '../controllers/negocio.controller';
import { validateJWT } from '../utils/validateJwt';
import { requireRole } from '../utils/requireRole';

export const routerNegocio = Router();

routerNegocio.use(validateJWT);
routerNegocio.use(requireRole('Superadmin'));

routerNegocio.get('/', findAll);
routerNegocio.get('/:id', findOne);
routerNegocio.post('/', create);
routerNegocio.put('/:id', update);
routerNegocio.delete('/:id', remove);
