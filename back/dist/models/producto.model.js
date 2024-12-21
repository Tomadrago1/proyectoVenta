"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Producto = void 0;
class Producto {
    constructor(id, nombre_producto, precio_compra, precio_venta, stock, codigo_barras) {
        this.id = id;
        this.nombre_producto = nombre_producto;
        this.precio_compra = precio_compra;
        this.precio_venta = precio_venta;
        this.stock = stock;
        this.codigo_barras = codigo_barras;
    }
}
exports.Producto = Producto;
