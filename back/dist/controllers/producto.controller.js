"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.findAll = findAll;
exports.findOne = findOne;
exports.create = create;
exports.update = update;
exports.remove = remove;
exports.findByName = findByName;
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
        const producto = new producto_model_1.Producto(req.body.id, req.body.nombre_producto, req.body.precio_compra, req.body.precio_venta, req.body.stock, req.body.codigo_barras);
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
        const { id } = req.params;
        const producto = new producto_model_1.Producto(parseInt(id), req.body.nombre_producto, req.body.precio_compra, req.body.precio_venta, req.body.stock, req.body.codigo_barras);
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
async function findByName(req, res) {
    try {
        const { name } = req.query; // Obtén el nombre del query string
        if (!name) {
            return res.status(400).json({ message: 'Se debe proporcionar un nombre para la búsqueda' });
        }
        const productos = await repository.findByName(name);
        if (productos) {
            return res.json(productos); // Devuelve los productos encontrados
        }
        else {
            return res.status(404).json({ message: 'No se encontraron productos con ese nombre' });
        }
    }
    catch (error) {
        const errorMessage = error.message || 'Error desconocido';
        return res.status(500).json({ message: 'Error al buscar el producto por nombre', errorMessage });
    }
}
