import { Repository } from '../shared/repository';
import { Producto } from '../models/producto.model';
import { pool } from '../shared/conn';
import { RowDataPacket, ResultSetHeader } from 'mysql2';

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
    // Realiza la inserción
    const [result] = await pool.query<ResultSetHeader>(
      'INSERT INTO productos (nombre_producto, precio) VALUES (?, ?)',
      [item.nombre_producto, item.precio]
    );

    // Obtén el ID generado para el nuevo producto
    const insertId = (result as any).insertId;

    // Verifica si la inserción fue exitosa
    if (insertId) {
      // Recupera el producto recién insertado usando el ID generado
      const [newProduct] = await pool.query<RowDataPacket[]>(
        'SELECT * FROM productos WHERE id_producto = ?',
        [insertId]
      );

      // Retorna el producto recién creado con su ID
      return newProduct[0] as Producto;
    } else {
      throw new Error('No se ha podido insertar el producto');
    }
  }

  public async update(item: { id: string }, producto: Producto): Promise<Producto | undefined> {
    const id = Number.parseInt(item.id);

    // Realiza la actualización
    const [result] = await pool.query<ResultSetHeader>(
      'UPDATE productos SET nombre_producto = ?, precio = ? WHERE id_producto = ?',
      [producto.nombre_producto, producto.precio, id]
    );

    // Verifica el número de filas afectadas
    const affectedRows = result.affectedRows;

    if (affectedRows === 1) {
      // Recupera el producto actualizado
      const [updatedProduct] = await pool.query<RowDataPacket[]>(
        'SELECT * FROM productos WHERE id_producto = ?',
        [id]
      );

      // Retorna el primer (y único) producto actualizado
      return updatedProduct[0] as Producto;  // Asegurarse de que el resultado sea un Producto
    } else {
      throw new Error('No se ha podido actualizar el producto o el producto no existe');
    }
  }



  public async remove(item: { id: string }): Promise<void> {
    const id = Number.parseInt(item.id);

    const [result_venta] = (await pool.query('SELECT * FROM detalle_venta WHERE id_producto = ?', [id])) as RowDataPacket[];
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
