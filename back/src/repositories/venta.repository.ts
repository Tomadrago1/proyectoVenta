import { Repository } from '../shared/repository';
import { Venta } from '../models/venta.model';
import { pool } from '../shared/conn';
import { RowDataPacket, ResultSetHeader } from 'mysql2';

export class VentaRepository implements Repository<Venta> {
  public async findAll(): Promise<Venta[] | undefined> {
    const [ventas] = await pool.query('SELECT * FROM ventas order by fecha_venta desc');
    return ventas as Venta[];
  }

  public async findOne(item: { id: string }): Promise<Venta | undefined> {
    const id = Number.parseInt(item.id);
    const [ventas] = (await pool.query<RowDataPacket[]>(
      'SELECT * FROM ventas WHERE id_venta = ?',
      [id]
    )) as RowDataPacket[];
    if (ventas.length === 0) {
      return undefined;
    }
    return ventas[0] as Venta;
  }

  public async save(item: Venta): Promise<Venta> {
    // Realiza la inserción de la venta
    const [result] = await pool.query<ResultSetHeader>(
      'INSERT INTO ventas (id_usuario, fecha_venta, total, monto_extra) VALUES (?, ?, ?, ?)',
      [item.id_usuario, item.fecha_venta, item.total, item.monto_extra]
    );
    const insertId = (result as any).insertId;
    if (insertId) {
      const [newVenta] = await pool.query<RowDataPacket[]>(
        'SELECT * FROM ventas WHERE id_venta = ?',
        [insertId]
      );
      return newVenta[0] as Venta;
    } else {
      throw new Error('No se ha podido insertar la venta');
    }
  }


  public async update(item: { id: string }, venta: Venta): Promise<Venta | undefined> {
    const id = Number.parseInt(item.id);

    const [result] = await pool.query<ResultSetHeader>(
      'UPDATE ventas SET id_usuario = ?, fecha_venta = ?, total = ?, monto_extra= ? WHERE id_venta = ?',
      [venta.id_usuario, venta.fecha_venta, venta.total, venta.monto_extra, id]
    );

    if (result.affectedRows === 1) {
      const [updatedVenta] = await pool.query<RowDataPacket[]>(
        'SELECT * FROM ventas WHERE id_venta = ?',
        [id]
      );
      return updatedVenta[0] as Venta;
    } else {
      throw new Error('No se ha podido actualizar la venta o la venta no existe');
    }
  }

  public async remove(item: { id: string }): Promise<void> {
    const id = Number.parseInt(item.id);

    const [detalleVenta] = (await pool.query('SELECT * FROM detalle_venta WHERE id_venta = ?', [id])) as RowDataPacket[];
    if (detalleVenta.length > 0) {
      throw new Error('No se puede borrar la venta porque tiene detalles asociados');
    }

    const [result] = await pool.query<ResultSetHeader>(
      'DELETE FROM ventas WHERE id_venta = ?',
      [id]
    );

    if (result.affectedRows === 0) {
      throw new Error('No se ha podido borrar la venta');
    }
  }
  public async filterByDateRange(startDate: Date, endDate: Date): Promise<Venta[]> {
    endDate.setUTCHours(23, 59, 59, 999);
    const startDateISO = startDate.toISOString();
    const endDateISO = endDate.toISOString();

    const [ventas] = await pool.query(
      'SELECT * FROM ventas WHERE fecha_venta BETWEEN ? AND ? ORDER BY fecha_venta DESC',
      [startDateISO, endDateISO]
    );

    return ventas as Venta[];
  }
}


