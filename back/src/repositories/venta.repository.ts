import { Repository } from '../shared/repository';
import { Venta } from '../models/venta.model';
import { pool } from '../shared/conn';
import { RowDataPacket, ResultSetHeader } from 'mysql2';

export class VentaRepository implements Repository<Venta> {
  public async findAll(idNegocio: number = 1): Promise<Venta[] | undefined> {
    const [ventas] = await pool.query(
      'SELECT * FROM ventas WHERE id_negocio = ? order by fecha_venta desc',
      [idNegocio]
    );
    return ventas as Venta[];
  }

  public async findOne(item: { id: string; id_negocio?: string }): Promise<Venta | undefined> {
    const id = Number.parseInt(item.id);
    const idNegocio = Number.parseInt(item.id_negocio ?? '1');
    const [ventas] = (await pool.query<RowDataPacket[]>(
      'SELECT * FROM ventas WHERE id_negocio = ? AND id_venta = ?',
      [idNegocio, id]
    )) as RowDataPacket[];
    if (ventas.length === 0) {
      return undefined;
    }
    return ventas[0] as Venta;
  }

  public async save(item: Venta): Promise<Venta> {
    // Realiza la inserción de la venta
    const [result] = await pool.query<ResultSetHeader>(
      'INSERT INTO ventas (id_negocio, id_usuario, fecha_venta, total, monto_extra) VALUES (?, ?, ?, ?, ?)',
      [item.id_negocio, item.id_usuario, item.fecha_venta, item.total, item.monto_extra]
    );
    const insertId = (result as any).insertId;
    if (insertId) {
      const [newVenta] = await pool.query<RowDataPacket[]>(
        'SELECT * FROM ventas WHERE id_negocio = ? AND id_venta = ?',
        [item.id_negocio, insertId]
      );
      return newVenta[0] as Venta;
    } else {
      throw new Error('No se ha podido insertar la venta');
    }
  }


  public async update(item: { id: string; id_negocio?: string }, venta: Venta): Promise<Venta | undefined> {
    const id = Number.parseInt(item.id);
    const idNegocio = Number.parseInt(item.id_negocio ?? '1');

    const [result] = await pool.query<ResultSetHeader>(
      'UPDATE ventas SET id_usuario = ?, fecha_venta = ?, total = ?, monto_extra= ? WHERE id_negocio = ? AND id_venta = ?',
      [venta.id_usuario, venta.fecha_venta, venta.total, venta.monto_extra, idNegocio, id]
    );

    if (result.affectedRows === 1) {
      const [updatedVenta] = await pool.query<RowDataPacket[]>(
        'SELECT * FROM ventas WHERE id_negocio = ? AND id_venta = ?',
        [idNegocio, id]
      );
      return updatedVenta[0] as Venta;
    } else {
      throw new Error('No se ha podido actualizar la venta o la venta no existe');
    }
  }

  public async remove(item: { id: string; id_negocio?: string }): Promise<void> {
    const id = Number.parseInt(item.id);
    const idNegocio = Number.parseInt(item.id_negocio ?? '1');

    const [detalleVenta] = (await pool.query(
      'SELECT * FROM detalle_venta WHERE id_negocio = ? AND id_venta = ?',
      [idNegocio, id]
    )) as RowDataPacket[];
    if (detalleVenta.length > 0) {
      throw new Error('No se puede borrar la venta porque tiene detalles asociados');
    }

    const [result] = await pool.query<ResultSetHeader>(
      'DELETE FROM ventas WHERE id_negocio = ? AND id_venta = ?',
      [idNegocio, id]
    );

    if (result.affectedRows === 0) {
      throw new Error('No se ha podido borrar la venta');
    }
  }
  public async filterByDateRange(startDate: Date, endDate: Date, idNegocio: number = 1): Promise<Venta[]> {
    endDate.setUTCHours(23, 59, 59, 999);
    const startDateISO = startDate.toISOString();
    const endDateISO = endDate.toISOString();

    const [ventas] = await pool.query(
      'SELECT * FROM ventas WHERE id_negocio = ? AND fecha_venta BETWEEN ? AND ? ORDER BY fecha_venta DESC',
      [idNegocio, startDateISO, endDateISO]
    );

    return ventas as Venta[];
  }
}


