"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.VentaRepository = void 0;
const conn_1 = require("../shared/conn");
class VentaRepository {
    async findAll() {
        const [ventas] = await conn_1.pool.query('SELECT * FROM ventas');
        return ventas;
    }
    async findOne(item) {
        const id = Number.parseInt(item.id);
        const [ventas] = (await conn_1.pool.query('SELECT * FROM ventas WHERE id_venta = ?', [id]));
        if (ventas.length === 0) {
            return undefined;
        }
        return ventas[0];
    }
    async save(item) {
        // Realiza la inserción de la venta
        const [result] = await conn_1.pool.query('INSERT INTO ventas (id_usuario, fecha_venta, total) VALUES (?, ?, ?)', [item.id_usuario, item.fecha_venta, item.total]);
        // Obtiene el ID generado para la nueva venta
        const insertId = result.insertId;
        // Verifica si la inserción fue exitosa
        if (insertId) {
            // Recupera la venta recién insertada usando el ID generado
            const [newVenta] = await conn_1.pool.query('SELECT * FROM ventas WHERE id_venta = ?', [insertId]);
            // Retorna la venta recién creada con su ID
            return newVenta[0];
        }
        else {
            throw new Error('No se ha podido insertar la venta');
        }
    }
    async update(item, venta) {
        const id = Number.parseInt(item.id);
        const [result] = await conn_1.pool.query('UPDATE ventas SET id_usuario = ?, fecha_venta = ?, total = ? WHERE id_venta = ?', [venta.id_usuario, venta.fecha_venta, venta.total, id]);
        if (result.affectedRows === 1) {
            const [updatedVenta] = await conn_1.pool.query('SELECT * FROM ventas WHERE id_venta = ?', [id]);
            return updatedVenta[0];
        }
        else {
            throw new Error('No se ha podido actualizar la venta o la venta no existe');
        }
    }
    async remove(item) {
        const id = Number.parseInt(item.id);
        const [detalleVenta] = (await conn_1.pool.query('SELECT * FROM detalle_venta WHERE id_venta = ?', [id]));
        if (detalleVenta.length > 0) {
            throw new Error('No se puede borrar la venta porque tiene detalles asociados');
        }
        const [result] = await conn_1.pool.query('DELETE FROM ventas WHERE id_venta = ?', [id]);
        if (result.affectedRows === 0) {
            throw new Error('No se ha podido borrar la venta');
        }
    }
    async filterByDateRange(startDate, endDate) {
        endDate.setUTCHours(23, 59, 59, 999);
        const [ventas] = await conn_1.pool.query('SELECT * FROM ventas WHERE fecha_venta BETWEEN ? AND ?', [startDate, endDate]);
        return ventas;
    }
}
exports.VentaRepository = VentaRepository;
