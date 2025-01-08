import { Request, Response } from 'express';
import { VentaRepository } from '../repositories/venta.repository';
import { Venta } from '../models/venta.model';

const repository = new VentaRepository();

async function findAll(req: Request, res: Response) {
  try {
    const ventas = await repository.findAll();
    res.json(ventas);
  } catch (error: any) {
    res.status(500).json({ message: 'Error al obtener las ventas', errorMessage: error.message });
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
    res.status(500).json({ message: 'Error al obtener la venta', errorMessage: error.message });
  }
}

async function create(req: Request, res: Response) {
  try {
    console.log("ESTE ES EL BODY DE LA REQ", req.body);
    const venta = new Venta(
      req.body.id_usuario,
      null,
      req.body.total,
      new Date(req.body.fecha_venta),
      req.body.monto_extra
    );
    console.log("ESTA ES LA VENTA A GUARDAR", venta);
    const result = await repository.save(venta);
    res.json(result);
  } catch (error: any) {
    res.status(500).json({ message: 'Error al crear la venta', errorMessage: error.message });
  }
}

async function update(req: Request, res: Response) {
  try {
    const { id } = req.params;
    const venta = new Venta(
      req.body.id_usuario,
      parseInt(id),
      req.body.total,
      new Date(req.body.fecha_venta),
      req.body.monto_extra
    );

    const result = await repository.update({ id }, venta);
    res.json(result);
  } catch (error: any) {
    res.status(500).json({ message: 'Error al actualizar la venta', errorMessage: error.message });
  }
}

async function remove(req: Request, res: Response) {
  try {
    const { id } = req.params;
    await repository.remove({ id });
    res.json({ message: 'Venta eliminada' });
  } catch (error: any) {
    res.status(500).json({ message: 'Error al eliminar la venta', errorMessage: error.message });
  }
}

async function filterByDateRange(req: Request, res: Response): Promise<void> {
  try {
    const { startDate, endDate } = req.query;

    if (!startDate || !endDate) {
      res.status(400).json({ message: 'Debe proporcionar startDate y endDate' });
      return;
    }
    const ventas = await repository.filterByDateRange(new Date(startDate as string), new Date(endDate as string));
    res.status(200).json(ventas);
  } catch (error: any) {
    res.status(500).json({ message: 'Error al filtrar ventas por rango de fechas', error: error.message });
  }
}

export { findAll, findOne, create, update, remove, filterByDateRange };
