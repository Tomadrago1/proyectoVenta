"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CategoriaRepository = void 0;
const conn_1 = require("../shared/conn");
class CategoriaRepository {
    async findAll(idNegocio = 1) {
        const [categorias] = await conn_1.pool.query('SELECT * FROM categoria WHERE id_negocio = ?', [idNegocio]);
        return categorias;
    }
    async findOne(item) {
        const id = Number.parseInt(item.id);
        const idNegocio = Number.parseInt(item.id_negocio ?? '1');
        const [categorias] = (await conn_1.pool.query('SELECT * FROM categoria WHERE id_negocio = ? AND id_categoria = ?', [idNegocio, id]));
        if (categorias.length === 0) {
            return undefined;
        }
        return categorias[0];
    }
    async save(item) {
        const [result] = await conn_1.pool.query('INSERT INTO categoria (id_negocio, nombre) VALUES (?, ?)', [item.id_negocio, item.nombre]);
        const insertId = result.insertId;
        if (insertId) {
            const [newCategoria] = await conn_1.pool.query('SELECT * FROM categoria WHERE id_negocio = ? AND id_categoria = ?', [item.id_negocio, insertId]);
            return newCategoria[0];
        }
        else {
            throw new Error('No se ha podido insertar la categoria');
        }
    }
    async update(item, categoria) {
        const id = Number.parseInt(item.id);
        const idNegocio = Number.parseInt(item.id_negocio ?? '1');
        const [result] = await conn_1.pool.query('UPDATE categoria SET nombre = ? WHERE id_negocio = ? AND id_categoria = ?', [categoria.nombre, idNegocio, id]);
        if (result.affectedRows === 1) {
            const [updatedCategoria] = await conn_1.pool.query('SELECT * FROM categoria WHERE id_negocio = ? AND id_categoria = ?', [idNegocio, id]);
            return updatedCategoria[0];
        }
        else {
            throw new Error('No se ha podido actualizar la categoria o la categoria no existe');
        }
    }
    async remove(item) {
        const id = Number.parseInt(item.id);
        const idNegocio = Number.parseInt(item.id_negocio ?? '1');
        const [result] = await conn_1.pool.query('DELETE FROM categoria WHERE id_negocio = ? AND id_categoria = ?', [idNegocio, id]);
        if (result.affectedRows === 0) {
            throw new Error('No se ha podido eliminar la categoria o la categoria no existe');
        }
    }
    async findByName(item) {
        const idNegocio = Number.parseInt(item.id_negocio ?? '1');
        const [categorias] = await conn_1.pool.query('SELECT * FROM categoria WHERE id_negocio = ? AND nombre LIKE ?', [idNegocio, `%${item.name}%`]);
        return categorias;
    }
}
exports.CategoriaRepository = CategoriaRepository;
