"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.routerUsuario = void 0;
const usuario_controller_1 = require("../controllers/usuario.controller"); // Asegúrate de tener este controlador
const express_1 = require("express");
exports.routerUsuario = (0, express_1.Router)();
// Ruta para obtener todos los usuarios
exports.routerUsuario.get('/', usuario_controller_1.findAll);
// Ruta para obtener un usuario específico por su ID
exports.routerUsuario.get('/:id', usuario_controller_1.findOne);
// Ruta para crear un nuevo usuario
exports.routerUsuario.post('/', usuario_controller_1.create);
// Ruta para actualizar un usuario existente
exports.routerUsuario.put('/:id', usuario_controller_1.update);
// Ruta para eliminar un usuario
exports.routerUsuario.delete('/:id', usuario_controller_1.remove);
exports.routerUsuario.post('/login', usuario_controller_1.login);
