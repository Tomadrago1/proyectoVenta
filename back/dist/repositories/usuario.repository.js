"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UsuarioRepository = void 0;
const conn_1 = require("../shared/conn");
class UsuarioRepository {
    async findAll() {
        const [usuarios] = await conn_1.pool.query('SELECT * FROM usuarios');
        return usuarios;
    }
    async findOne(item) {
        const id_usuario = Number.parseInt(item.id);
        const [usuarios] = await conn_1.pool.query('SELECT * FROM usuarios WHERE id_usuario = ?', [id_usuario]);
        if (usuarios.length === 0) {
            return undefined;
        }
        const usuario = usuarios[0];
        return usuario;
    }
    async save(item) {
        const [result] = (await conn_1.pool.query('INSERT INTO usuarios (nombre, apellido, username, contrasena) VALUES (?, ?, ?, ?)', [
            item.nombre,
            item.apellido,
            item.username,
            item.contrasena
        ]));
        const affectedRows = result.affectedRows;
        if (affectedRows === 1) {
            return item;
        }
        else {
            throw new Error('No se ha podido insertar el usuario');
        }
    }
    async update(item, usuario) {
        const id_usuario = Number.parseInt(item.id);
        const [result] = (await conn_1.pool.query('UPDATE usuarios SET nombre = ?, apellido = ?, username = ?, contrasena = ? WHERE id_usuario = ?', [
            usuario.nombre,
            usuario.apellido,
            usuario.username,
            usuario.contrasena,
            id_usuario
        ]));
        const affectedRows = result.affectedRows;
        if (affectedRows === 1) {
            return usuario;
        }
        else {
            throw new Error('No se ha podido actualizar el usuario');
        }
    }
    async remove(item) {
        const id_usuario = Number.parseInt(item.id);
        const [result] = (await conn_1.pool.query('DELETE FROM usuarios WHERE id_usuario = ?', [id_usuario]));
        const affectedRows = result.affectedRows;
        if (affectedRows === 0) {
            throw new Error('No se ha podido eliminar el usuario');
        }
    }
    async findByUsername(username) {
        const [usuarios] = await conn_1.pool.query('SELECT * FROM usuarios WHERE username = ?', [username]);
        if (usuarios.length === 0) {
            return undefined;
        }
        const usuario = usuarios[0];
        return usuario;
    }
}
exports.UsuarioRepository = UsuarioRepository;
