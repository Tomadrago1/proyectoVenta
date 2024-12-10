import { Repository } from '../shared/repository';
import { Venta } from '../models/venta.model';
import { pool } from '../shared/conn';
import { RowDataPacket, ResultSetHeader } from 'mysql2';

export class VentaRepository implements Repository<Venta> {
  public async findAll(): Promise<Venta[] | undefined> {
    const [ventas] = await pool.query('SELECT * FROM ventas');
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
      'INSERT INTO ventas (id_usuario, fecha_venta, total) VALUES (?, ?, ?)',
      [item.id_usuario, item.fecha_venta, item.total]
    );

    // Obtiene el ID generado para la nueva venta
    const insertId = (result as any).insertId;

    // Verifica si la inserción fue exitosa
    if (insertId) {
      // Recupera la venta recién insertada usando el ID generado
      const [newVenta] = await pool.query<RowDataPacket[]>(
        'SELECT * FROM ventas WHERE id_venta = ?',
        [insertId]
      );

      // Retorna la venta recién creada con su ID
      return newVenta[0] as Venta;
    } else {
      throw new Error('No se ha podido insertar la venta');
    }
  }


  public async update(item: { id: string }, venta: Venta): Promise<Venta | undefined> {
    const id = Number.parseInt(item.id);

    const [result] = await pool.query<ResultSetHeader>(
      'UPDATE ventas SET id_usuario = ?, fecha_venta = ?, total = ? WHERE id_venta = ?',
      [venta.id_usuario, venta.fecha_venta, venta.total, id]
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
}
