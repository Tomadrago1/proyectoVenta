"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DetalleVentaRepository = void 0;
const conn_1 = require("../shared/conn");
class DetalleVentaRepository {
    async findAll() {
        const [detalles] = await conn_1.pool.query('SELECT * FROM detalle_venta');
        return detalles;
    }
    async findOne(item) {
        const idVenta = Number.parseInt(item.id_venta);
        const idProducto = Number.parseInt(item.id_producto);
        const [detalles] = (await conn_1.pool.query('SELECT * FROM detalle_venta WHERE id_venta = ? AND id_producto = ?', [idVenta, idProducto]));
        if (detalles.length === 0) {
            return undefined;
        }
        return detalles[0];
    }
    async save(item) {
        const [result] = await conn_1.pool.query('INSERT INTO detalle_venta (id_venta, id_producto, cantidad, precio_unitario) VALUES (?, ?, ?, ?)', [item.id_venta, item.id_producto, item.cantidad, item.precio_unitario]);
        if (result.affectedRows === 1) {
            const [newDetalle] = await conn_1.pool.query('SELECT * FROM detalle_venta WHERE id_venta = ? AND id_producto = ?', [item.id_venta, item.id_producto]);
            return newDetalle[0];
        }
        else {
            throw new Error('No se ha podido insertar el detalle de la venta');
        }
    }
    // Actualizar un detalle de venta existente
    async update(item, detalle) {
        const idVenta = Number.parseInt(item.id_venta);
        const idProducto = Number.parseInt(item.id_producto);
        const [result] = await conn_1.pool.query('UPDATE detalle_venta SET cantidad = ?, precio_unitario = ? WHERE id_venta = ? AND id_producto = ?', [detalle.cantidad, detalle.precio_unitario, idVenta, idProducto]);
        if (result.affectedRows === 1) {
            const [updatedDetalle] = await conn_1.pool.query('SELECT * FROM detalle_venta WHERE id_venta = ? AND id_producto = ?', [idVenta, idProducto]);
            return updatedDetalle[0];
        }
        else {
            throw new Error('No se ha podido actualizar el detalle de la venta o no existe');
        }
    }
    // Eliminar un detalle de venta
    async remove(item) {
        const idVenta = Number.parseInt(item.id_venta);
        const idProducto = Number.parseInt(item.id_producto);
        const [result] = await conn_1.pool.query('DELETE FROM detalle_venta WHERE id_venta = ? AND id_producto = ?', [idVenta, idProducto]);
        if (result.affectedRows === 0) {
            throw new Error('No se ha podido borrar el detalle de la venta');
        }
    }
}
exports.DetalleVentaRepository = DetalleVentaRepository;
