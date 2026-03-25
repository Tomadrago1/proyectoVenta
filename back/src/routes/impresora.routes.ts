import { Router } from 'express';
import { imprimir, test } from '../printer/impresora.config';
import { validateJWT } from '../utils/validateJwt';

export const routerImpresora = Router();

routerImpresora.use(validateJWT);

routerImpresora.post('/imprimir', imprimir);

routerImpresora.post('/test-imprimir', test);

