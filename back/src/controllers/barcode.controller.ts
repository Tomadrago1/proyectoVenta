import { Request, Response } from 'express';
import { BarcodeConfigRepository } from '../repositories/barcodeConfig.repository';
import { BarcodeInterceptorService, BarcodeValidationError } from '../services/barcode.service';
import { BarcodeConfig, ValueType } from '../models/barcodeConfig.model';
import { resolveBusinessIdFromRequest } from '../shared/tenant';

const repository = new BarcodeConfigRepository();
const service = new BarcodeInterceptorService(repository);

// ══════════════════════════════════════════════════════════════════════
// Parser — Endpoint principal para la caja
// ══════════════════════════════════════════════════════════════════════

async function parseBarcode(req: Request, res: Response) {
  try {
    const idNegocio = resolveBusinessIdFromRequest(req);
    const { barcode } = req.body;

    if (!barcode || typeof barcode !== 'string') {
      return res.status(400).json({
        message: 'El campo "barcode" es requerido y debe ser un string.',
      });
    }

    const result = await service.parse(barcode.trim(), idNegocio);
    res.json(result);
  } catch (error: any) {
    if (error instanceof BarcodeValidationError) {
      return res.status(400).json({ message: error.message });
    }
    console.error('Error al parsear código de barras:', error);
    res.status(500).json({ message: 'Error interno del servidor al procesar el código de barras' });
  }
}

// ══════════════════════════════════════════════════════════════════════
// CRUD de configuraciones de balanza
// ══════════════════════════════════════════════════════════════════════

async function findAllConfigs(req: Request, res: Response) {
  try {
    const idNegocio = resolveBusinessIdFromRequest(req);
    const configs = await repository.findAll(idNegocio);
    res.json(configs);
  } catch (error: any) {
    console.error('Error al obtener configuraciones de código de barras:', error);
    res.status(500).json({ message: 'Error interno del servidor' });
  }
}

async function findOneConfig(req: Request, res: Response) {
  try {
    const { id } = req.params;
    const idNegocio = resolveBusinessIdFromRequest(req);
    const config = await repository.findOne({ id, id_negocio: idNegocio.toString() });
    if (config) {
      res.json(config);
    } else {
      res.status(404).json({ message: 'Configuración no encontrada' });
    }
  } catch (error: any) {
    console.error('Error al obtener configuración:', error);
    res.status(500).json({ message: 'Error interno del servidor' });
  }
}

async function createConfig(req: Request, res: Response) {
  try {
    const idNegocio = resolveBusinessIdFromRequest(req);
    const config = new BarcodeConfig(
      0, // auto-increment
      idNegocio,
      req.body.prefix,
      req.body.plu_length,
      req.body.value_length,
      req.body.value_type ?? ValueType.PRICE,
      req.body.decimal_places ?? 2,
      req.body.descripcion ?? null,
      req.body.activo !== undefined ? req.body.activo : true,
    );
    const result = await repository.save(config);
    res.status(201).json(result);
  } catch (error: any) {
    console.error('Error al crear configuración de código de barras:', error);
    const errorMessage = error.message || 'Error desconocido';
    res.status(500).json({ message: 'Error al crear la configuración', errorMessage });
  }
}

async function updateConfig(req: Request, res: Response) {
  try {
    const { id } = req.params;
    const idNegocio = resolveBusinessIdFromRequest(req);
    const config = new BarcodeConfig(
      parseInt(id),
      idNegocio,
      req.body.prefix,
      req.body.plu_length,
      req.body.value_length,
      req.body.value_type ?? ValueType.PRICE,
      req.body.decimal_places ?? 2,
      req.body.descripcion ?? null,
      req.body.activo !== undefined ? req.body.activo : true,
    );
    const result = await repository.update({ id, id_negocio: idNegocio.toString() }, config);
    res.json(result);
  } catch (error: any) {
    console.error('Error al actualizar configuración:', error);
    const errorMessage = error.message || 'Error desconocido';
    res.status(500).json({ message: 'Error al actualizar la configuración', errorMessage });
  }
}

async function removeConfig(req: Request, res: Response) {
  try {
    const { id } = req.params;
    const idNegocio = resolveBusinessIdFromRequest(req);
    await repository.remove({ id, id_negocio: idNegocio.toString() });
    res.json({ message: 'Configuración eliminada' });
  } catch (error: any) {
    console.error('Error al eliminar configuración:', error);
    const errorMessage = error.message || 'Error desconocido';
    res.status(500).json({ message: 'Error al eliminar la configuración', errorMessage });
  }
}

export { parseBarcode, findAllConfigs, findOneConfig, createConfig, updateConfig, removeConfig };
