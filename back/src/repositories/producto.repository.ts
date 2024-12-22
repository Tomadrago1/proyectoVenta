import { Repository } from '../shared/repository';
import { Producto } from '../models/producto.model';
import { pool } from '../shared/conn';
import { RowDataPacket, ResultSetHeader } from 'mysql2';

export class ProductoRepository implements Repository<Producto> {
  public async findAll(): Promise<Producto[] | undefined> {
    const [productos] = await pool.query('SELECT * FROM productos order by id_categoria');
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
    return productos[0] as Producto;
  }

  public async save(item: Producto): Promise<Producto> {
    const [result] = await pool.query<ResultSetHeader>(
      'INSERT INTO productos (id_categoria, nombre_producto, precio_compra, precio_venta, stock, codigo_barras) VALUES (?, ?, ?, ?, ?, ?)',
      [item.id_categoria, item.nombre_producto, item.precio_compra, item.precio_venta, item.stock, item.codigo_barras]
    );

    const insertId = result.insertId;

    if (insertId) {
      const [newProduct] = await pool.query<RowDataPacket[]>(
        'SELECT * FROM productos WHERE id_producto = ?',
        [insertId]
      );
      return newProduct[0] as Producto;
    } else {
      throw new Error('No se ha podido insertar el producto');
    }
  }

  public async update(item: { id: string }, producto: Producto): Promise<Producto | undefined> {
    const id = Number.parseInt(item.id);

    const [result] = await pool.query<ResultSetHeader>(
      'UPDATE productos SET id_categoria= ?, nombre_producto = ?, precio_compra = ?, precio_venta = ?, stock = ?, codigo_barras = ? WHERE id_producto = ?',
      [producto.id_categoria, producto.nombre_producto, producto.precio_compra, producto.precio_venta, producto.stock, producto.codigo_barras, id]
    );

    if (result.affectedRows === 1) {
      const [updatedProduct] = await pool.query<RowDataPacket[]>(
        'SELECT * FROM productos WHERE id_producto = ?',
        [id]
      );
      return updatedProduct[0] as Producto;
    } else {
      throw new Error('No se ha podido actualizar el producto o el producto no existe');
    }
  }

  public async remove(item: { id: string }): Promise<void> {
    const id = Number.parseInt(item.id);

    const [resultVenta] = (await pool.query<RowDataPacket[]>(
      'SELECT * FROM detalle_venta WHERE id_producto = ?',
      [id]
    )) as RowDataPacket[];
    if (resultVenta.length > 0) {
      throw new Error('No se puede borrar el producto porque tiene ventas asociadas');
    }

    const [result] = (await pool.query<ResultSetHeader>(
      'DELETE FROM productos WHERE id_producto = ?',
      [id]
    )) as ResultSetHeader[];

    if (result.affectedRows === 0) {
      throw new Error('No se ha podido borrar el producto');
    }
  }

  public async findByBarcode(item: { barcode: string }): Promise<Producto | undefined> {
    const [productos] = (await pool.query<RowDataPacket[]>(
      'SELECT * FROM productos WHERE codigo_barras = ?',
      [item.barcode]
    )) as RowDataPacket[];
    if (productos.length === 0) {
      return undefined;
    }
    return productos[0] as Producto;
  }

  public async findByName(item: { name: string }): Promise<Producto[]> {
    const [productos] = await pool.query<RowDataPacket[]>(
      'SELECT * FROM productos WHERE nombre_producto LIKE ?',
      [`%${item.name}%`] // Utilizar % para permitir coincidencias parciales
    ) as RowDataPacket[];

    return productos as Producto[]; // Retorna todos los productos encontrados
  }

  public async updateStock(item: { id: string, stock: string }): Promise<Producto | undefined> {
    const id = Number.parseInt(item.id);
    const stock = Number.parseInt(item.stock);
    const [result] = await pool.query<ResultSetHeader>(
      'UPDATE productos SET stock = ? WHERE id_producto = ?',
      [stock, id]
    );

    if (result.affectedRows === 1) {
      const [updatedProduct] = await pool.query<RowDataPacket[]>(
        'SELECT * FROM productos WHERE id_producto = ?',
        [id]
      );
      return updatedProduct[0] as Producto;
    } else {
      throw new Error('No se ha podido actualizar el stock del producto o el producto no existe');
    }
  }
}
