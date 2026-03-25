import { Request, Response } from 'express';
import { DetalleVentaRepository } from '../repositories/detalleVenta.repository';
import { DetalleVenta } from '../models/detalleVenta.model';
import { resolveBusinessIdFromRequest } from '../shared/tenant';

const repository = new DetalleVentaRepository();

async function findAll(req: Request, res: Response) {
  try {
    const idNegocio = resolveBusinessIdFromRequest(req);
    const detalles = await repository.findAll(idNegocio);
    res.json(detalles);
  } catch (error: any) {
    const errorMessage = error.message || 'Error desconocido';
    res.status(500).json({ message: 'Error al obtener los detalles de venta', errorMessage });
  }
}

async function findOne(req: Request, res: Response) {
  try {
    const { id_venta, id_producto } = req.params;  // Cambiar id a id_venta y id_producto
    const idNegocio = resolveBusinessIdFromRequest(req);
    const detalle = await repository.findOne({
      id_venta,
      id_producto,
      id_negocio: idNegocio.toString(),
    });
    if (detalle) {
      res.json(detalle);
    } else {
      res.status(404).json({ message: 'Detalle de venta no encontrado' });
    }
  } catch (error: any) {
    const errorMessage = error.message || 'Error desconocido';
    res.status(500).json({ message: 'Error al obtener el detalle de venta', errorMessage });
  }
}

async function create(req: Request, res: Response) {
  try {
    const idNegocio = resolveBusinessIdFromRequest(req);
    const detalle = new DetalleVenta(
      idNegocio,
      req.body.id_producto,
      req.body.id_venta,
      req.body.cantidad,
      req.body.precio_unitario
    );
    const result = await repository.save(detalle);
    res.json(result);
  } catch (error: any) {
    const errorMessage = error.message || 'Error desconocido';
    res.status(500).json({ message: 'Error al crear el detalle de venta', errorMessage });
  }
}

async function update(req: Request, res: Response) {
  try {
    const { id_venta, id_producto } = req.params;  // Cambiar id a id_venta y id_producto
    const idNegocio = resolveBusinessIdFromRequest(req);
    const detalle = new DetalleVenta(
      idNegocio,
      parseInt(id_producto),
      parseInt(id_venta),
      req.body.cantidad,
      req.body.precio_unitario
    );

    const result = await repository.update(
      { id_venta, id_producto, id_negocio: idNegocio.toString() },
      detalle
    );
    res.json(result);
  } catch (error: any) {
    const errorMessage = error.message || 'Error desconocido';
    res.status(500).json({ message: 'Error al actualizar el detalle de venta', errorMessage });
  }
}

async function remove(req: Request, res: Response) {
  try {
    const { id_venta, id_producto } = req.params;  // Cambiar id a id_venta y id_producto
    const idNegocio = resolveBusinessIdFromRequest(req);
    await repository.remove({ id_venta, id_producto, id_negocio: idNegocio.toString() });
    res.json({ message: 'Detalle de venta eliminado' });
  } catch (error: any) {
    const errorMessage = error.message || 'Error desconocido';
    res.status(500).json({ message: 'Error al eliminar el detalle de venta', errorMessage });
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
    res.status(500).json({ message: 'Error al obtener los detalles de venta', errorMessage });
  }
}

export { findAll, findOne, create, update, remove, findByVenta };
