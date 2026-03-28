import { Router } from 'express';
import { imprimir_ticket, test } from '../printer/printer.controller';
import { validateJWT } from '../utils/validateJwt';

export const routerImpresora = Router();

routerImpresora.use(validateJWT);

routerImpresora.post('/imprimir-ticket', imprimir_ticket);

routerImpresora.post('/test-imprimir', test);

