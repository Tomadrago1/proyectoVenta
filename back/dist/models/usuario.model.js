"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Usuario = void 0;
class Usuario {
    constructor(id_usuario, nombre, apellido, username, contrasena, id_rol, id_negocio, nombre_rol) {
        this.id_usuario = id_usuario;
        this.nombre = nombre;
        this.apellido = apellido;
        this.username = username;
        this.contrasena = contrasena;
        this.id_rol = id_rol;
        this.id_negocio = id_negocio;
        this.nombre_rol = nombre_rol;
    }
}
exports.Usuario = Usuario;
