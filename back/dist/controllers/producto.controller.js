"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.findAll = findAll;
exports.findOne = findOne;
exports.create = create;
exports.update = update;
exports.remove = remove;
const producto_repository_1 = require("../repositories/producto.repository");
const producto_model_1 = require("../models/producto.model");
const repository = new producto_repository_1.ProductoRepository();
async function findAll(req, res) {
    try {
        const productos = await repository.findAll();
        res.json(productos);
    }
    catch (error) {
        const errorMessage = error.message || 'Error desconocido';
        res.status(500).json({ message: 'Error al obtener los productos', errorMessage });
    }
}
async function findOne(req, res) {
    try {
        const { id } = req.params;
        const producto = await repository.findOne({ id });
        if (producto) {
            res.json(producto);
        }
        else {
            res.status(404).json({ message: 'Producto no encontrado' });
        }
    }
    catch (error) {
        const errorMessage = error.message || 'Error desconocido';
        res.status(500).json({ message: 'Error al obtener el producto', errorMessage });
    }
}
async function create(req, res) {
    try {
        const producto = new producto_model_1.Producto(req.body.id, req.body.nombre_producto, req.body.precio);
        const result = await repository.save(producto);
        res.json(result);
    }
    catch (error) {
        const errorMessage = error.message || 'Error desconocido';
        res.status(500).json({ message: 'Error al crear el producto', errorMessage });
    }
}
async function update(req, res) {
    try {
        const { id } = req.params; // Obtener el id desde los parámetros de la URL
        const producto = new producto_model_1.Producto(parseInt(id), // Convertir el id en número
        req.body.nombre_producto, // Cambié "nombre" por "nombre_producto" para coincidir con tu clase
        req.body.precio);
        const result = await repository.update({ id }, producto);
        res.json(result);
    }
    catch (error) {
        const errorMessage = error.message || 'Error desconocido';
        res.status(500).json({ message: 'Error al actualizar el producto', errorMessage });
    }
}
async function remove(req, res) {
    try {
        const { id } = req.params;
        await repository.remove({ id });
        res.json({ message: 'Producto eliminado' });
    }
    catch (error) {
        const errorMessage = error.message || 'Error desconocido';
        res.status(500).json({ message: 'Error al eliminar el producto', errorMessage });
    }
}
