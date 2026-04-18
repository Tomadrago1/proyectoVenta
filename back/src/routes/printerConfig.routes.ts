import { Router } from 'express';
import { getConfig, saveConfig, removeConfig, getTicketData } from '../controllers/printerConfig.controller';
import { validateJWT } from '../utils/validateJwt';

export const routerPrinterConfig = Router();

routerPrinterConfig.use(validateJWT);

// Configuración de impresora (1 por negocio)
routerPrinterConfig.get('/config', getConfig);
routerPrinterConfig.put('/config', saveConfig);
routerPrinterConfig.delete('/config', removeConfig);

// Datos de ticket para impresión desde el frontend
routerPrinterConfig.get('/ticket-data/:id_venta', getTicketData);
