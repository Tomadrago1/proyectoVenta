import { Repository } from '../shared/repository';
import { Producto } from '../models/producto.model';
import { pool } from '../shared/conn';
import { RowDataPacket, ResultSetHeader } from 'mysql2';

export class ProductoRepository implements Repository<Producto> {
  public async findAll(idNegocio: number = 1): Promise<Producto[] | undefined> {
    const [productos] = await pool.query(
      'SELECT * FROM productos WHERE id_negocio = ? order by id_categoria',
      [idNegocio]
    );
    return productos as Producto[];
  }

  public async findOne(item: { id: string; id_negocio?: string }): Promise<Producto | undefined> {
    const id = Number.parseInt(item.id);
    const idNegocio = Number.parseInt(item.id_negocio ?? '1');
    const [productos] = (await pool.query<RowDataPacket[]>(
      'SELECT * FROM productos WHERE id_negocio = ? AND id_producto = ?',
      [idNegocio, id]
    )) as RowDataPacket[];
    if (productos.length === 0) {
      return undefined;
    }
    return productos[0] as Producto;
  }

  public async save(item: Producto): Promise<Producto> {
    const [result] = await pool.query<ResultSetHeader>(
      'INSERT INTO productos (id_negocio, id_categoria, nombre_producto, precio_compra, precio_venta, stock, codigo_barras) VALUES (?, ?, ?, ?, ?, ?, ?)',
      [
        item.id_negocio,
        item.id_categoria,
        item.nombre_producto,
        item.precio_compra,
        item.precio_venta,
        item.stock,
        item.codigo_barras,
      ]
    );

    const insertId = result.insertId;

    if (insertId) {
      const [newProduct] = await pool.query<RowDataPacket[]>(
        'SELECT * FROM productos WHERE id_negocio = ? AND id_producto = ?',
        [item.id_negocio, insertId]
      );
      return newProduct[0] as Producto;
    } else {
      throw new Error('No se ha podido insertar el producto');
    }
  }

  public async update(item: { id: string; id_negocio?: string }, producto: Producto): Promise<Producto | undefined> {
    const id = Number.parseInt(item.id);
    const idNegocio = Number.parseInt(item.id_negocio ?? '1');

    const [result] = await pool.query<ResultSetHeader>(
      'UPDATE productos SET id_categoria= ?, nombre_producto = ?, precio_compra = ?, precio_venta = ?, stock = ?, codigo_barras = ? WHERE id_negocio = ? AND id_producto = ?',
      [
        producto.id_categoria,
        producto.nombre_producto,
        producto.precio_compra,
        producto.precio_venta,
        producto.stock,
        producto.codigo_barras,
        idNegocio,
        id,
      ]
    );

    if (result.affectedRows === 1) {
      const [updatedProduct] = await pool.query<RowDataPacket[]>(
        'SELECT * FROM productos WHERE id_negocio = ? AND id_producto = ?',
        [idNegocio, id]
      );
      return updatedProduct[0] as Producto;
    } else {
      throw new Error('No se ha podido actualizar el producto o el producto no existe');
    }
  }

  public async remove(item: { id: string; id_negocio?: string }): Promise<void> {
    const id = Number.parseInt(item.id);
    const idNegocio = Number.parseInt(item.id_negocio ?? '1');

    const [resultVenta] = (await pool.query<RowDataPacket[]>(
      'SELECT * FROM detalle_venta WHERE id_negocio = ? AND id_producto = ?',
      [idNegocio, id]
    )) as RowDataPacket[];
    if (resultVenta.length > 0) {
      throw new Error('No se puede borrar el producto porque tiene ventas asociadas');
    }

    const [result] = (await pool.query<ResultSetHeader>(
      'DELETE FROM productos WHERE id_negocio = ? AND id_producto = ?',
      [idNegocio, id]
    )) as ResultSetHeader[];

    if (result.affectedRows === 0) {
      throw new Error('No se ha podido borrar el producto');
    }
  }

  public async findByBarcode(item: { barcode: string; id_negocio?: string }): Promise<Producto | undefined> {
    const idNegocio = Number.parseInt(item.id_negocio ?? '1');
    const [productos] = (await pool.query<RowDataPacket[]>(
      'SELECT * FROM productos WHERE id_negocio = ? AND codigo_barras = ?',
      [idNegocio, item.barcode]
    )) as RowDataPacket[];
    if (productos.length === 0) {
      return undefined;
    }
    return productos[0] as Producto;
  }

  public async findByName(item: { name: string; id_negocio?: string }): Promise<Producto[]> {
    const idNegocio = Number.parseInt(item.id_negocio ?? '1');
    const [productos] = await pool.query<RowDataPacket[]>(
      'SELECT * FROM productos WHERE id_negocio = ? AND nombre_producto LIKE ?',
      [idNegocio, `%${item.name}%`] // Utilizar % para permitir coincidencias parciales
    ) as RowDataPacket[];

    return productos as Producto[]; // Retorna todos los productos encontrados
  }

  public async updateStock(item: { id: string; stock: string; id_negocio?: string }): Promise<Producto | undefined> {
    const id = Number.parseInt(item.id);
    const stock = Number.parseInt(item.stock);
    const idNegocio = Number.parseInt(item.id_negocio ?? '1');
    const [result] = await pool.query<ResultSetHeader>(
      'UPDATE productos SET stock = ? WHERE id_negocio = ? AND id_producto = ?',
      [stock, idNegocio, id]
    );

    if (result.affectedRows === 1) {
      const [updatedProduct] = await pool.query<RowDataPacket[]>(
        'SELECT * FROM productos WHERE id_negocio = ? AND id_producto = ?',
        [idNegocio, id]
      );
      return updatedProduct[0] as Producto;
    } else {
      throw new Error('No se ha podido actualizar el stock del producto o el producto no existe');
    }
  }

  public async decrementStock(item: { id: string; cantidad: number; id_negocio?: string }): Promise<Producto | undefined> {
    const id = Number.parseInt(item.id);
    const cantidad = item.cantidad;
    const idNegocio = Number.parseInt(item.id_negocio ?? '1');

    if (isNaN(id)) {
      throw new Error(`ID de producto inválido: "${item.id}"`);
    }

    const [result] = await pool.query<ResultSetHeader>(
      'UPDATE productos SET stock = stock - ? WHERE id_negocio = ? AND id_producto = ?',
      [cantidad, idNegocio, id]
    );


    if (result.affectedRows === 1) {
      const [updatedProduct] = await pool.query<RowDataPacket[]>(
        'SELECT * FROM productos WHERE id_negocio = ? AND id_producto = ?',
        [idNegocio, id]
      );
      return updatedProduct[0] as Producto;
    } else {
      throw new Error('No se ha podido decrementar el stock del producto');
    }
  }
}
