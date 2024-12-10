import { Request, Response } from 'express';
import { VentaRepository } from '../repositories/venta.repository';
import { Venta } from '../models/venta.model';

const repository = new VentaRepository();

async function findAll(req: Request, res: Response) {
  try {
    const ventas = await repository.findAll();
    res.json(ventas);
  } catch (error: any) {
    const errorMessage = error.message || 'Error desconocido';
    res.status(500).json({ message: 'Error al obtener las ventas', errorMessage });
  }
}

async function findOne(req: Request, res: Response) {
  try {
    const { id } = req.params;
    const venta = await repository.findOne({ id });
    if (venta) {
      res.json(venta);
    } else {
      res.status(404).json({ message: 'Venta no encontrada' });
    }
  } catch (error: any) {
    const errorMessage = error.message || 'Error desconocido';
    res.status(500).json({ message: 'Error al obtener la venta', errorMessage });
  }
}

async function create(req: Request, res: Response) {
  try {
    // Crear una instancia de Venta, el id_venta se pasará como null para que sea autogenerado
    const venta = new Venta(
      req.body.id_usuario,  // id_usuario que vendrá en el cuerpo de la solicitud
      null,                 // id_venta es null ya que se generará automáticamente
      req.body.total,       // El total de la venta
      new Date(req.body.fecha_venta), // La fecha de la venta
    );

    const result = await repository.save(venta);
    res.json(result);
  } catch (error: any) {
    const errorMessage = error.message || 'Error desconocido';
    res.status(500).json({ message: 'Error al crear la venta', errorMessage });
  }
}

async function update(req: Request, res: Response) {
  try {
    const { id } = req.params;
    const venta = new Venta(
      req.body.id_usuario,  // id_usuario que vendrá en el cuerpo de la solicitud
      parseInt(id),         // id_venta, este debe ser el ID de la venta que queremos actualizar
      req.body.total,       // El total de la venta
      new Date(req.body.fecha_venta), // La fecha de la venta
    );

    const result = await repository.update({ id }, venta);
    res.json(result);
  } catch (error: any) {
    const errorMessage = error.message || 'Error desconocido';
    res.status(500).json({ message: 'Error al actualizar la venta', errorMessage });
  }
}

async function remove(req: Request, res: Response) {
  try {
    const { id } = req.params;
    await repository.remove({ id });
    res.json({ message: 'Venta eliminada' });
  } catch (error: any) {
    const errorMessage = error.message || 'Error desconocido';
    res.status(500).json({ message: 'Error al eliminar la venta', errorMessage });
  }
}

export { findAll, findOne, create, update, remove };
