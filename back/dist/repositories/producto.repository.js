"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ProductoRepository = void 0;
const conn_1 = require("../shared/conn");
class ProductoRepository {
    async findAll() {
        const [productos] = await conn_1.pool.query('SELECT * FROM productos');
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
        const [result] = await conn_1.pool.query('INSERT INTO productos (nombre_producto, precio_compra, precio_venta, stock, codigo_barras) VALUES (?, ?, ?, ?, ?)', [item.nombre_producto, item.precio_compra, item.precio_venta, item.stock, item.codigo_barras]);
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
        const [result] = await conn_1.pool.query('UPDATE productos SET nombre_producto = ?, precio_compra = ?, precio_venta = ?, stock = ?, codigo_barras = ? WHERE id_producto = ?', [producto.nombre_producto, producto.precio_compra, producto.precio_venta, producto.stock, producto.codigo_barras, id]);
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
    async findByName(name) {
        const [productos] = await conn_1.pool.query('SELECT * FROM productos WHERE nombre_producto LIKE ?', [`%${name}%`]);
        return productos.length > 0 ? productos : undefined;
    }
}
exports.ProductoRepository = ProductoRepository;
