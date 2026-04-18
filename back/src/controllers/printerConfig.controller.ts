import { Request, Response } from 'express';
import { PrinterConfigRepository } from '../repositories/printerConfig.repository';
import { obtenerDetallesConProductos, obtenerNegocio } from '../printer/printer.repository';
import { resolveBusinessIdFromRequest } from '../shared/tenant';

const repository = new PrinterConfigRepository();

// ══════════════════════════════════════════════════════════════════════
// Configuración de impresora (1 por negocio)
// ══════════════════════════════════════════════════════════════════════

async function getConfig(req: Request, res: Response) {
  try {
    const idNegocio = resolveBusinessIdFromRequest(req);
    const config = await repository.findByNegocio(idNegocio);
    if (!config) {
      return res.json(null);
    }
    res.json(config);
  } catch (error: any) {
    console.error('Error al obtener configuración de impresora:', error);
    res.status(500).json({ message: 'Error interno del servidor' });
  }
}

async function saveConfig(req: Request, res: Response) {
  try {
    const idNegocio = resolveBusinessIdFromRequest(req);
    const { paper_width, vendor_id, product_id, printer_name } = req.body;

    if (!paper_width || !['58mm', '80mm'].includes(paper_width)) {
      return res.status(400).json({ message: 'paper_width debe ser "58mm" o "80mm".' });
    }

    const config = await repository.upsert({
      id_negocio: idNegocio,
      paper_width,
      vendor_id: vendor_id ?? null,
      product_id: product_id ?? null,
      printer_name: printer_name ?? null,
      columns_count: paper_width === '58mm' ? 32 : 48,
    });

    res.json(config);
  } catch (error: any) {
    console.error('Error al guardar configuración de impresora:', error);
    res.status(500).json({ message: 'Error al guardar la configuración', error: error.message });
  }
}

async function removeConfig(req: Request, res: Response) {
  try {
    const idNegocio = resolveBusinessIdFromRequest(req);
    await repository.remove(idNegocio);
    res.json({ message: 'Configuración de impresora eliminada' });
  } catch (error: any) {
    console.error('Error al eliminar configuración de impresora:', error);
    res.status(500).json({ message: 'Error al eliminar la configuración', error: error.message });
  }
}

// ══════════════════════════════════════════════════════════════════════
// Datos de ticket para impresión desde el frontend (WebUSB)
// ══════════════════════════════════════════════════════════════════════

async function getTicketData(req: Request, res: Response) {
  try {
    const idNegocio = resolveBusinessIdFromRequest(req);
    const idVenta = parseInt(req.params.id_venta, 10);

    if (isNaN(idVenta)) {
      return res.status(400).json({ message: 'id_venta inválido.' });
    }

    const [detalles, negocio, config] = await Promise.all([
      obtenerDetallesConProductos(idVenta, idNegocio),
      obtenerNegocio(idNegocio),
      repository.findByNegocio(idNegocio),
    ]);

    res.json({
      detalles,
      negocio,
      printerConfig: config,
    });
  } catch (error: any) {
    console.error('Error al obtener datos del ticket:', error);
    res.status(500).json({ message: 'Error al obtener datos del ticket', error: error.message });
  }
}

export { getConfig, saveConfig, removeConfig, getTicketData };
