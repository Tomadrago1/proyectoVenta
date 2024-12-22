"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.findAll = findAll;
exports.findOne = findOne;
exports.create = create;
exports.update = update;
exports.remove = remove;
const categoria_repository_1 = require("../repositories/categoria.repository");
const categoria_model_1 = require("../models/categoria.model");
const repository = new categoria_repository_1.CategoriaRepository();
async function findAll(req, res) {
    try {
        const categorias = await repository.findAll();
        res.json(categorias);
    }
    catch (error) {
        const errorMessage = error.message || 'Error desconocido';
        res.status(500).json({ message: 'Error al obtener las categorias', errorMessage });
    }
}
async function findOne(req, res) {
    try {
        const { id } = req.params;
        const categoria = await repository.findOne({ id });
        if (categoria) {
            res.json(categoria);
        }
        else {
            res.status(404).json({ message: 'Categoria no encontrada' });
        }
    }
    catch (error) {
        const errorMessage = error.message || 'Error desconocido';
        res.status(500).json({ message: 'Error al obtener la categoria', errorMessage });
    }
}
async function create(req, res) {
    try {
        console.log(req.body);
        const categoria = new categoria_model_1.Categoria(req.body.id, req.body.nombre);
        console.log(categoria);
        const result = await repository.save(categoria);
        res.json(result);
    }
    catch (error) {
        const errorMessage = error.message || 'Error desconocido';
        res.status(500).json({ message: 'Error al crear la categoria', errorMessage });
    }
}
async function update(req, res) {
    try {
        const { id } = req.params;
        const categoria = new categoria_model_1.Categoria(parseInt(id), req.body.nombre);
        const result = await repository.update({ id }, categoria);
        res.json(result);
    }
    catch (error) {
        const errorMessage = error.message || 'Error desconocido';
        res.status(500).json({ message: 'Error al actualizar la categoria', errorMessage });
    }
}
async function remove(req, res) {
    try {
        const { id } = req.params;
        await repository.remove({ id });
        res.json({ message: 'Categoria eliminada' });
    }
    catch (error) {
        const errorMessage = error.message || 'Error desconocido';
        res.status(500).json({ message: 'Error al eliminar la categoria', errorMessage });
    }
}
