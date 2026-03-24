import { Router } from 'express';
import { imprimir, test } from '../printer/impresora.config';

export const routerImpresora = Router();

routerImpresora.post('/imprimir', imprimir);

routerImpresora.post('/test-imprimir', test);

