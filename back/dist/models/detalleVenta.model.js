"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DetalleVenta = void 0;
class DetalleVenta {
    constructor(id_producto, id_venta, cantidad, precio_unitario) {
        this.id_producto = id_producto;
        this.id_venta = id_venta;
        this.cantidad = cantidad;
        this.precio_unitario = precio_unitario;
    }
}
exports.DetalleVenta = DetalleVenta;
