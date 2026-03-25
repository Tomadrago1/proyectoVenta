"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ProductoRepository = void 0;
const conn_1 = require("../shared/conn");
class ProductoRepository {
    async findAll(idNegocio = 1) {
        const [productos] = await conn_1.pool.query('SELECT * FROM productos WHERE id_negocio = ? order by id_categoria', [idNegocio]);
        return productos;
    }
    async findOne(item) {
        const id = Number.parseInt(item.id);
        const idNegocio = Number.parseInt(item.id_negocio ?? '1');
        const [productos] = (await conn_1.pool.query('SELECT * FROM productos WHERE id_negocio = ? AND id_producto = ?', [idNegocio, id]));
        if (productos.length === 0) {
            return undefined;
        }
        return productos[0];
    }
    async save(item) {
        const [result] = await conn_1.pool.query('INSERT INTO productos (id_negocio, id_categoria, nombre_producto, precio_compra, precio_venta, stock, codigo_barras) VALUES (?, ?, ?, ?, ?, ?, ?)', [
            item.id_negocio,
            item.id_categoria,
            item.nombre_producto,
            item.precio_compra,
            item.precio_venta,
            item.stock,
            item.codigo_barras,
        ]);
        const insertId = result.insertId;
        if (insertId) {
            const [newProduct] = await conn_1.pool.query('SELECT * FROM productos WHERE id_negocio = ? AND id_producto = ?', [item.id_negocio, insertId]);
            return newProduct[0];
        }
        else {
            throw new Error('No se ha podido insertar el producto');
        }
    }
    async update(item, producto) {
        const id = Number.parseInt(item.id);
        const idNegocio = Number.parseInt(item.id_negocio ?? '1');
        const [result] = await conn_1.pool.query('UPDATE productos SET id_categoria= ?, nombre_producto = ?, precio_compra = ?, precio_venta = ?, stock = ?, codigo_barras = ? WHERE id_negocio = ? AND id_producto = ?', [
            producto.id_categoria,
            producto.nombre_producto,
            producto.precio_compra,
            producto.precio_venta,
            producto.stock,
            producto.codigo_barras,
            idNegocio,
            id,
        ]);
        if (result.affectedRows === 1) {
            const [updatedProduct] = await conn_1.pool.query('SELECT * FROM productos WHERE id_negocio = ? AND id_producto = ?', [idNegocio, id]);
            return updatedProduct[0];
        }
        else {
            throw new Error('No se ha podido actualizar el producto o el producto no existe');
        }
    }
    async remove(item) {
        const id = Number.parseInt(item.id);
        const idNegocio = Number.parseInt(item.id_negocio ?? '1');
        const [resultVenta] = (await conn_1.pool.query('SELECT * FROM detalle_venta WHERE id_negocio = ? AND id_producto = ?', [idNegocio, id]));
        if (resultVenta.length > 0) {
            throw new Error('No se puede borrar el producto porque tiene ventas asociadas');
        }
        const [result] = (await conn_1.pool.query('DELETE FROM productos WHERE id_negocio = ? AND id_producto = ?', [idNegocio, id]));
        if (result.affectedRows === 0) {
            throw new Error('No se ha podido borrar el producto');
        }
    }
    async findByBarcode(item) {
        const idNegocio = Number.parseInt(item.id_negocio ?? '1');
        const [productos] = (await conn_1.pool.query('SELECT * FROM productos WHERE id_negocio = ? AND codigo_barras = ?', [idNegocio, item.barcode]));
        if (productos.length === 0) {
            return undefined;
        }
        return productos[0];
    }
    async findByName(item) {
        const idNegocio = Number.parseInt(item.id_negocio ?? '1');
        const [productos] = await conn_1.pool.query('SELECT * FROM productos WHERE id_negocio = ? AND nombre_producto LIKE ?', [idNegocio, `%${item.name}%`] // Utilizar % para permitir coincidencias parciales
        );
        return productos; // Retorna todos los productos encontrados
    }
    async updateStock(item) {
        const id = Number.parseInt(item.id);
        const stock = Number.parseInt(item.stock);
        const idNegocio = Number.parseInt(item.id_negocio ?? '1');
        const [result] = await conn_1.pool.query('UPDATE productos SET stock = ? WHERE id_negocio = ? AND id_producto = ?', [stock, idNegocio, id]);
        if (result.affectedRows === 1) {
            const [updatedProduct] = await conn_1.pool.query('SELECT * FROM productos WHERE id_negocio = ? AND id_producto = ?', [idNegocio, id]);
            return updatedProduct[0];
        }
        else {
            throw new Error('No se ha podido actualizar el stock del producto o el producto no existe');
        }
    }
    async decrementStock(item) {
        const id = Number.parseInt(item.id);
        const cantidad = item.cantidad;
        const idNegocio = Number.parseInt(item.id_negocio ?? '1');
        if (isNaN(id)) {
            throw new Error(`ID de producto inválido: "${item.id}"`);
        }
        const [result] = await conn_1.pool.query('UPDATE productos SET stock = stock - ? WHERE id_negocio = ? AND id_producto = ?', [cantidad, idNegocio, id]);
        if (result.affectedRows === 1) {
            const [updatedProduct] = await conn_1.pool.query('SELECT * FROM productos WHERE id_negocio = ? AND id_producto = ?', [idNegocio, id]);
            return updatedProduct[0];
        }
        else {
            throw new Error('No se ha podido decrementar el stock del producto');
        }
    }
}
exports.ProductoRepository = ProductoRepository;
