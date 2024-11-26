import { Repository } from '../shared/repository';
import { Producto } from '../models/producto.model';
import { pool } from '../shared/conn';
import { RowDataPacket } from 'mysql2';

export class ProductoRepository implements Repository<Producto> {
  public async findAll(): Promise<Producto[] | undefined> {
    const [productos] = await pool.query('SELECT * FROM productos');
    return productos as Producto[];
  }

  public async findOne(item: { id: string }): Promise<Producto | undefined> {
    const id = Number.parseInt(item.id);
    const [productos] = (await pool.query<RowDataPacket[]>(
      'SELECT * FROM productos WHERE id_producto = ?',
      [id]
    )) as RowDataPacket[];
    if (productos.length === 0) {
      return undefined;
    }
    const producto = productos[0] as Producto;
    return producto;
  }

  public async save(item: Producto): Promise<Producto> {
    const [result] = (await pool.query(
      'INSERT INTO productos (nombre, precio) VALUES (?, ?)',
      [item.nombre, item.precio, item.precio]
    )) as RowDataPacket[];
    const affectedRows = (result as any).affectedRows;
    if (affectedRows === 1) {
      return item;
    } else {
      throw new Error('No se ha podido insertar el producto');
    }
  }

  public async update(item: { id: string }, producto: Producto): Promise<Producto | undefined> {
    const id = Number.parseInt(item.id);
    const [result] = (await pool.query(
      'UPDATE productos SET nombre = ?, precio = ? WHERE id = ?',
      [producto.nombre, producto.precio, id]
    )) as RowDataPacket[];
    const affectedRows = (result as any).affectedRows;
    if (affectedRows === 1) {
      return producto;
    } else {
      throw new Error('No se ha podido actualizar el producto');
    }
  }

  public async remove(item: { id: string }): Promise<void> {
    const id = Number.parseInt(item.id);

    const [result_venta] = (await pool.query('SELECT * FROM ventas WHERE id_producto = ?', [id])) as RowDataPacket[];
    if ((result_venta as any).length > 0) {
      throw new Error('No se puede borrar el producto porque tiene ventas asociadas');
    }

    const [result] = (await pool.query('DELETE FROM productos WHERE id_producto = ?', [id])) as RowDataPacket[];
    const affectedRows = (result as any).affectedRows;
    if (affectedRows === 0) {
      throw new Error('No se ha podido borrar el producto');
    }
  }
}
