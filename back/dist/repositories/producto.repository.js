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
        const producto = productos[0];
        return producto;
    }
    async save(item) {
        // Realiza la inserción
        const [result] = await conn_1.pool.query('INSERT INTO productos (nombre_producto, precio) VALUES (?, ?)', [item.nombre_producto, item.precio]);
        // Obtén el ID generado para el nuevo producto
        const insertId = result.insertId;
        // Verifica si la inserción fue exitosa
        if (insertId) {
            // Recupera el producto recién insertado usando el ID generado
            const [newProduct] = await conn_1.pool.query('SELECT * FROM productos WHERE id_producto = ?', [insertId]);
            // Retorna el producto recién creado con su ID
            return newProduct[0];
        }
        else {
            throw new Error('No se ha podido insertar el producto');
        }
    }
    async update(item, producto) {
        const id = Number.parseInt(item.id);
        // Realiza la actualización
        const [result] = await conn_1.pool.query('UPDATE productos SET nombre_producto = ?, precio = ? WHERE id_producto = ?', [producto.nombre_producto, producto.precio, id]);
        // Verifica el número de filas afectadas
        const affectedRows = result.affectedRows;
        if (affectedRows === 1) {
            // Recupera el producto actualizado
            const [updatedProduct] = await conn_1.pool.query('SELECT * FROM productos WHERE id_producto = ?', [id]);
            // Retorna el primer (y único) producto actualizado
            return updatedProduct[0]; // Asegurarse de que el resultado sea un Producto
        }
        else {
            throw new Error('No se ha podido actualizar el producto o el producto no existe');
        }
    }
    async remove(item) {
        const id = Number.parseInt(item.id);
        const [result_venta] = (await conn_1.pool.query('SELECT * FROM detalle_venta WHERE id_producto = ?', [id]));
        if (result_venta.length > 0) {
            throw new Error('No se puede borrar el producto porque tiene ventas asociadas');
        }
        const [result] = (await conn_1.pool.query('DELETE FROM productos WHERE id_producto = ?', [id]));
        const affectedRows = result.affectedRows;
        if (affectedRows === 0) {
            throw new Error('No se ha podido borrar el producto');
        }
    }
}
exports.ProductoRepository = ProductoRepository;
