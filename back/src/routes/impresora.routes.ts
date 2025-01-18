import { Router } from 'express';
import { imprimir } from '../utils/impresora.config';

export const routerImpresora = Router();

routerImpresora.post('/imprimir', imprimir);

