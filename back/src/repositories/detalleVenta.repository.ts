import { Repository } from '../shared/repository';
import { DetalleVenta } from '../models/detalleVenta.model';
import { pool } from '../shared/conn';
import { RowDataPacket, ResultSetHeader } from 'mysql2';

export class DetalleVentaRepository implements Repository<DetalleVenta> {

  public async findAll(): Promise<DetalleVenta[] | undefined> {
    const [detalles] = await pool.query('SELECT * FROM detalle_venta');
    return detalles as DetalleVenta[];
  }

  public async findOne(item: { id_venta: string, id_producto: string }): Promise<DetalleVenta | undefined> {
    const idVenta = Number.parseInt(item.id_venta);
    const idProducto = Number.parseInt(item.id_producto);

    const [detalles] = (await pool.query<RowDataPacket[]>(
      'SELECT * FROM detalle_venta WHERE id_venta = ? AND id_producto = ?',
      [idVenta, idProducto]
    )) as RowDataPacket[];

    if (detalles.length === 0) {
      return undefined;
    }

    return detalles[0] as DetalleVenta;
  }

  public async save(item: DetalleVenta): Promise<DetalleVenta> {
    const [result] = await pool.query<ResultSetHeader>(
      'INSERT INTO detalle_venta (id_venta, id_producto, cantidad, precio_unitario) VALUES (?, ?, ?, ?)',
      [item.id_venta, item.id_producto, item.cantidad, item.precio_unitario]
    );
    if (result.affectedRows === 1) {
      const [newDetalle] = await pool.query<RowDataPacket[]>(
        'SELECT * FROM detalle_venta WHERE id_venta = ? AND id_producto = ?',
        [item.id_venta, item.id_producto]
      );
      return newDetalle[0] as DetalleVenta;
    } else {
      throw new Error('No se ha podido insertar el detalle de la venta');
    }
  }


  // Actualizar un detalle de venta existente
  public async update(item: { id_venta: string, id_producto: string }, detalle: DetalleVenta): Promise<DetalleVenta | undefined> {
    const idVenta = Number.parseInt(item.id_venta);
    const idProducto = Number.parseInt(item.id_producto);

    const [result] = await pool.query<ResultSetHeader>(
      'UPDATE detalle_venta SET cantidad = ?, precio_unitario = ? WHERE id_venta = ? AND id_producto = ?',
      [detalle.cantidad, detalle.precio_unitario, idVenta, idProducto]
    );

    if (result.affectedRows === 1) {
      const [updatedDetalle] = await pool.query<RowDataPacket[]>(
        'SELECT * FROM detalle_venta WHERE id_venta = ? AND id_producto = ?',
        [idVenta, idProducto]
      );
      return updatedDetalle[0] as DetalleVenta;
    } else {
      throw new Error('No se ha podido actualizar el detalle de la venta o no existe');
    }
  }

  // Eliminar un detalle de venta
  public async remove(item: { id_venta: string, id_producto: string }): Promise<void> {
    const idVenta = Number.parseInt(item.id_venta);
    const idProducto = Number.parseInt(item.id_producto);

    const [result] = await pool.query<ResultSetHeader>(
      'DELETE FROM detalle_venta WHERE id_venta = ? AND id_producto = ?',
      [idVenta, idProducto]
    );

    if (result.affectedRows === 0) {
      throw new Error('No se ha podido borrar el detalle de la venta');
    }
  }

  public async findByVenta(idVenta: string): Promise<DetalleVenta[] | undefined> {
    const id = Number.parseInt(idVenta);
    const [detalles] = await pool.query('SELECT * FROM detalle_venta WHERE id_venta = ?', [id]);
    return detalles as DetalleVenta[];
  }
}
