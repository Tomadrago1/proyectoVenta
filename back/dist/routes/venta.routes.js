"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.routerVenta = void 0;
const venta_controller_1 = require("../controllers/venta.controller");
const express_1 = require("express");
exports.routerVenta = (0, express_1.Router)();
// Ruta para obtener todas las ventas
exports.routerVenta.get('/', venta_controller_1.findAll);
// Ruta para obtener una venta específica por su ID
exports.routerVenta.get('/:id', venta_controller_1.findOne);
// Ruta para crear una nueva venta
exports.routerVenta.post('/', venta_controller_1.create);
// Ruta para actualizar una venta existente
exports.routerVenta.put('/:id', venta_controller_1.update);
// Ruta para eliminar una venta
exports.routerVenta.delete('/:id', venta_controller_1.remove);
