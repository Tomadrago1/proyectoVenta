import { DetalleVentaGenerico } from '../models/detalleVentaGenerico.model';
import { pool } from '../shared/conn';
import { RowDataPacket, ResultSetHeader } from 'mysql2';

export class DetalleVentaGenericoRepository {
  public async save(item: DetalleVentaGenerico): Promise<DetalleVentaGenerico> {
    const [result] = await pool.query<ResultSetHeader>(
      'INSERT INTO detalle_venta_generico (id_negocio, id_venta, cantidad, precio_unitario, descripcion) VALUES (?, ?, ?, ?, ?)',
      [item.id_negocio, item.id_venta, item.cantidad, item.precio_unitario, item.descripcion]
    );
    const insertId = result.insertId;
    if (insertId) {
      item.id_detalle_generico = insertId;
      return item;
    } else {
      throw new Error('No se ha podido insertar el detalle de venta generico');
    }
  }

  public async findByVenta(id_venta: string, id_negocio: string): Promise<DetalleVentaGenerico[]> {
    const id = Number.parseInt(id_venta);
    const idNegocio = Number.parseInt(id_negocio);
    const [detalles] = await pool.query(
      'SELECT * FROM detalle_venta_generico WHERE id_negocio = ? AND id_venta = ?',
      [idNegocio, id]
    );
    return detalles as DetalleVentaGenerico[];
  }
}
