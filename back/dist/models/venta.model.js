"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Venta = void 0;
class Venta {
    constructor(id_usuario, id_venta, total, fecha_venta, monto_extra) {
        this.id_usuario = id_usuario;
        this.id_venta = id_venta;
        this.total = total;
        this.fecha_venta = fecha_venta;
        this.monto_extra = monto_extra;
    }
}
exports.Venta = Venta;
