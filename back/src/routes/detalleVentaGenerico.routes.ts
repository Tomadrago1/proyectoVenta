import { Router } from 'express';
import { create, findByVenta } from '../controllers/detalleVentaGenerico.controller';
import { validateJWT } from '../utils/validateJwt';

export const routerDetalleVentaGenerico = Router();

routerDetalleVentaGenerico.use(validateJWT);

routerDetalleVentaGenerico.get('/:id_venta/', findByVenta);
routerDetalleVentaGenerico.post('/', create);
