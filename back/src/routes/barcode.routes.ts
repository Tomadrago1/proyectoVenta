import {
  parseBarcode,
  findAllConfigs,
  findOneConfig,
  createConfig,
  updateConfig,
  removeConfig,
} from '../controllers/barcode.controller';
import { Router } from 'express';
import { validateJWT } from '../utils/validateJwt';

export const routerBarcode = Router();

routerBarcode.use(validateJWT);

// Parser — Endpoint principal para la caja
routerBarcode.post('/parse', parseBarcode);

// CRUD de configuraciones de balanza
routerBarcode.get('/config', findAllConfigs);
routerBarcode.get('/config/:id', findOneConfig);
routerBarcode.post('/config', createConfig);
routerBarcode.put('/config/:id', updateConfig);
routerBarcode.delete('/config/:id', removeConfig);
