"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.routerProducto = void 0;
const producto_controller_1 = require("../controllers/producto.controller");
const express_1 = require("express");
exports.routerProducto = (0, express_1.Router)();
// Ruta para obtener todos los productos
exports.routerProducto.get('/', producto_controller_1.findAll);
// Ruta para obtener un producto específico por su ID
exports.routerProducto.get('/:id', producto_controller_1.findOne);
// Ruta para crear un nuevo producto
exports.routerProducto.post('/', producto_controller_1.create);
// Ruta para actualizar un producto existente
exports.routerProducto.put('/:id', producto_controller_1.update);
// Ruta para eliminar un producto
exports.routerProducto.delete('/:id', producto_controller_1.remove);
