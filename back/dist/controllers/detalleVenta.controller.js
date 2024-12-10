"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.findAll = findAll;
exports.findOne = findOne;
exports.create = create;
exports.update = update;
exports.remove = remove;
const detalleVenta_repository_1 = require("../repositories/detalleVenta.repository");
const detalleVenta_model_1 = require("../models/detalleVenta.model");
const repository = new detalleVenta_repository_1.DetalleVentaRepository();
async function findAll(req, res) {
    try {
        const detalles = await repository.findAll();
        res.json(detalles);
    }
    catch (error) {
        const errorMessage = error.message || 'Error desconocido';
        res.status(500).json({ message: 'Error al obtener los detalles de venta', errorMessage });
    }
}
async function findOne(req, res) {
    try {
        const { id_venta, id_producto } = req.params; // Cambiar id a id_venta y id_producto
        const detalle = await repository.findOne({ id_venta, id_producto });
        if (detalle) {
            res.json(detalle);
        }
        else {
            res.status(404).json({ message: 'Detalle de venta no encontrado' });
        }
    }
    catch (error) {
        const errorMessage = error.message || 'Error desconocido';
        res.status(500).json({ message: 'Error al obtener el detalle de venta', errorMessage });
    }
}
async function create(req, res) {
    try {
        const detalle = new detalleVenta_model_1.DetalleVenta(req.body.id_producto, req.body.id_venta, req.body.cantidad, req.body.precio_unitario);
        const result = await repository.save(detalle);
        res.json(result);
    }
    catch (error) {
        const errorMessage = error.message || 'Error desconocido';
        res.status(500).json({ message: 'Error al crear el detalle de venta', errorMessage });
    }
}
async function update(req, res) {
    try {
        const { id_venta, id_producto } = req.params; // Cambiar id a id_venta y id_producto
        const detalle = new detalleVenta_model_1.DetalleVenta(parseInt(id_producto), parseInt(id_venta), req.body.cantidad, req.body.precio_unitario);
        const result = await repository.update({ id_venta, id_producto }, detalle); // Cambiar id a id_venta y id_producto
        res.json(result);
    }
    catch (error) {
        const errorMessage = error.message || 'Error desconocido';
        res.status(500).json({ message: 'Error al actualizar el detalle de venta', errorMessage });
    }
}
async function remove(req, res) {
    try {
        const { id_venta, id_producto } = req.params; // Cambiar id a id_venta y id_producto
        await repository.remove({ id_venta, id_producto });
        res.json({ message: 'Detalle de venta eliminado' });
    }
    catch (error) {
        const errorMessage = error.message || 'Error desconocido';
        res.status(500).json({ message: 'Error al eliminar el detalle de venta', errorMessage });
    }
}
