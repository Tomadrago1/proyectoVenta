import { Request, Response } from 'express';
import { DetalleVentaGenericoRepository } from '../repositories/detalleVentaGenerico.repository';
import { DetalleVentaGenerico } from '../models/detalleVentaGenerico.model';
import { resolveBusinessIdFromRequest } from '../shared/tenant';

const repository = new DetalleVentaGenericoRepository();

async function create(req: Request, res: Response) {
  try {
    const idNegocio = resolveBusinessIdFromRequest(req);
    if (req.body.genericos && Array.isArray(req.body.genericos)) {
       for (const gen of req.body.genericos) {
         const genItem = new DetalleVentaGenerico(
           null,
           idNegocio,
           req.body.id_venta,
           gen.cantidad || 1,
           gen.precio_unitario,
           gen.descripcion || 'Producto Genérico'
         );
         await repository.save(genItem);
       }
    }
    res.json({ message: 'Detalles genéricos creados exitosamente' });
  } catch (error: any) {
    const errorMessage = error.message || 'Error desconocido';
    res.status(500).json({ message: 'Error al crear los detalles genéricos', errorMessage });
  }
}

async function findByVenta(req: Request, res: Response) {
  try {
    const { id_venta } = req.params;
    const idNegocio = resolveBusinessIdFromRequest(req);
    const detalles = await repository.findByVenta(id_venta, idNegocio.toString());
    res.json(detalles);
  } catch (error: any) {
    const errorMessage = error.message || 'Error desconocido';
    res.status(500).json({ message: 'Error al obtener los detalles genéricos de venta', errorMessage });
  }
}

export { create, findByVenta };
