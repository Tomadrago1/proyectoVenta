import { Request, Response } from 'express';
import { DetalleVentaRepository } from '../repositories/detalleVenta.repository';
import { DetalleVenta } from '../models/detalleVenta.model';

const repository = new DetalleVentaRepository();

async function findAll(req: Request, res: Response) {
  try {
    const detalles = await repository.findAll();
    res.json(detalles);
  } catch (error: any) {
    const errorMessage = error.message || 'Error desconocido';
    res.status(500).json({ message: 'Error al obtener los detalles de venta', errorMessage });
  }
}

async function findOne(req: Request, res: Response) {
  try {
    const { id_venta, id_producto } = req.params;  // Cambiar id a id_venta y id_producto
    const detalle = await repository.findOne({ id_venta, id_producto });
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
    const detalle = new DetalleVenta(
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
    const detalle = new DetalleVenta(
      parseInt(id_producto),
      parseInt(id_venta),
      req.body.cantidad,
      req.body.precio_unitario
    );

    const result = await repository.update({ id_venta, id_producto }, detalle);  // Cambiar id a id_venta y id_producto
    res.json(result);
  } catch (error: any) {
    const errorMessage = error.message || 'Error desconocido';
    res.status(500).json({ message: 'Error al actualizar el detalle de venta', errorMessage });
  }
}

async function remove(req: Request, res: Response) {
  try {
    const { id_venta, id_producto } = req.params;  // Cambiar id a id_venta y id_producto
    await repository.remove({ id_venta, id_producto });
    res.json({ message: 'Detalle de venta eliminado' });
  } catch (error: any) {
    const errorMessage = error.message || 'Error desconocido';
    res.status(500).json({ message: 'Error al eliminar el detalle de venta', errorMessage });
  }
}

async function findByVenta(req: Request, res: Response) {
  try {
    const { id_venta } = req.params;
    const detalles = await repository.findByVenta(id_venta);
    res.json(detalles);
  } catch (error: any) {
    const errorMessage = error.message || 'Error desconocido';
    res.status(500).json({ message: 'Error al obtener los detalles de venta', errorMessage });
  }
}

export { findAll, findOne, create, update, remove, findByVenta };
