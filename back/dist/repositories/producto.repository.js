"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ProductoRepository = void 0;
const conn_1 = require("../shared/conn");
class ProductoRepository {
    async findAll() {
        const [productos] = await conn_1.pool.query('SELECT * FROM productos order by id_categoria');
        return productos;
    }
    async findOne(item) {
        const id = Number.parseInt(item.id);
        const [productos] = (await conn_1.pool.query('SELECT * FROM productos WHERE id_producto = ?', [id]));
        if (productos.length === 0) {
            return undefined;
        }
        return productos[0];
    }
    async save(item) {
        const [result] = await conn_1.pool.query('INSERT INTO productos (id_categoria, nombre_producto, precio_compra, precio_venta, stock, codigo_barras) VALUES (?, ?, ?, ?, ?, ?)', [item.id_categoria, item.nombre_producto, item.precio_compra, item.precio_venta, item.stock, item.codigo_barras]);
        const insertId = result.insertId;
        if (insertId) {
            const [newProduct] = await conn_1.pool.query('SELECT * FROM productos WHERE id_producto = ?', [insertId]);
            return newProduct[0];
        }
        else {
            throw new Error('No se ha podido insertar el producto');
        }
    }
    async update(item, producto) {
        const id = Number.parseInt(item.id);
        const [result] = await conn_1.pool.query('UPDATE productos SET id_categoria= ?, nombre_producto = ?, precio_compra = ?, precio_venta = ?, stock = ?, codigo_barras = ? WHERE id_producto = ?', [producto.id_categoria, producto.nombre_producto, producto.precio_compra, producto.precio_venta, producto.stock, producto.codigo_barras, id]);
        if (result.affectedRows === 1) {
            const [updatedProduct] = await conn_1.pool.query('SELECT * FROM productos WHERE id_producto = ?', [id]);
            return updatedProduct[0];
        }
        else {
            throw new Error('No se ha podido actualizar el producto o el producto no existe');
        }
    }
    async remove(item) {
        const id = Number.parseInt(item.id);
        const [resultVenta] = (await conn_1.pool.query('SELECT * FROM detalle_venta WHERE id_producto = ?', [id]));
        if (resultVenta.length > 0) {
            throw new Error('No se puede borrar el producto porque tiene ventas asociadas');
        }
        const [result] = (await conn_1.pool.query('DELETE FROM productos WHERE id_producto = ?', [id]));
        if (result.affectedRows === 0) {
            throw new Error('No se ha podido borrar el producto');
        }
    }
    async findByBarcode(item) {
        const [productos] = (await conn_1.pool.query('SELECT * FROM productos WHERE codigo_barras = ?', [item.barcode]));
        if (productos.length === 0) {
            return undefined;
        }
        return productos[0];
    }
    async findByName(item) {
        const [productos] = await conn_1.pool.query('SELECT * FROM productos WHERE nombre_producto LIKE ?', [`%${item.name}%`] // Utilizar % para permitir coincidencias parciales
        );
        return productos; // Retorna todos los productos encontrados
    }
    async updateStock(item) {
        const id = Number.parseInt(item.id);
        const stock = Number.parseInt(item.stock);
        const [result] = await conn_1.pool.query('UPDATE productos SET stock = ? WHERE id_producto = ?', [stock, id]);
        if (result.affectedRows === 1) {
            const [updatedProduct] = await conn_1.pool.query('SELECT * FROM productos WHERE id_producto = ?', [id]);
            return updatedProduct[0];
        }
        else {
            throw new Error('No se ha podido actualizar el stock del producto o el producto no existe');
        }
    }
    async decrementStock(item) {
        const id = Number.parseInt(item.id);
        const cantidad = item.cantidad;
        if (isNaN(id)) {
            throw new Error(`ID de producto inválido: "${item.id}"`);
        }
        const [result] = await conn_1.pool.query('UPDATE productos SET stock = stock - ? WHERE id_producto = ?', [cantidad, id]);
        if (result.affectedRows === 1) {
            const [updatedProduct] = await conn_1.pool.query('SELECT * FROM productos WHERE id_producto = ?', [id]);
            return updatedProduct[0];
        }
        else {
            throw new Error('No se ha podido decrementar el stock del producto');
        }
    }
}
exports.ProductoRepository = ProductoRepository;
