import { Router } from 'express';
import { findAll } from '../controllers/rol.controller';
import { validateJWT } from '../utils/validateJwt';

export const routerRol = Router();

routerRol.use(validateJWT);
routerRol.get('/', findAll);
