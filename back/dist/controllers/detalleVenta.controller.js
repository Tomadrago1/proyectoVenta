"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.findAll = findAll;
exports.findOne = findOne;
exports.create = create;
exports.update = update;
exports.remove = remove;
exports.findByVenta = findByVenta;
const detalleVenta_repository_1 = require("../repositories/detalleVenta.repository");
const detalleVenta_model_1 = require("../models/detalleVenta.model");
const tenant_1 = require("../shared/tenant");
const repository = new detalleVenta_repository_1.DetalleVentaRepository();
async function findAll(req, res) {
    try {
        const idNegocio = (0, tenant_1.resolveBusinessIdFromRequest)(req);
        const detalles = await repository.findAll(idNegocio);
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
        const idNegocio = (0, tenant_1.resolveBusinessIdFromRequest)(req);
        const detalle = await repository.findOne({
            id_venta,
            id_producto,
            id_negocio: idNegocio.toString(),
        });
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
        const idNegocio = (0, tenant_1.resolveBusinessIdFromRequest)(req);
        const detalle = new detalleVenta_model_1.DetalleVenta(idNegocio, req.body.id_producto, req.body.id_venta, req.body.cantidad, req.body.precio_unitario);
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
        const idNegocio = (0, tenant_1.resolveBusinessIdFromRequest)(req);
        const detalle = new detalleVenta_model_1.DetalleVenta(idNegocio, parseInt(id_producto), parseInt(id_venta), req.body.cantidad, req.body.precio_unitario);
        const result = await repository.update({ id_venta, id_producto, id_negocio: idNegocio.toString() }, detalle);
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
        const idNegocio = (0, tenant_1.resolveBusinessIdFromRequest)(req);
        await repository.remove({ id_venta, id_producto, id_negocio: idNegocio.toString() });
        res.json({ message: 'Detalle de venta eliminado' });
    }
    catch (error) {
        const errorMessage = error.message || 'Error desconocido';
        res.status(500).json({ message: 'Error al eliminar el detalle de venta', errorMessage });
    }
}
async function findByVenta(req, res) {
    try {
        const { id_venta } = req.params;
        const idNegocio = (0, tenant_1.resolveBusinessIdFromRequest)(req);
        const detalles = await repository.findByVenta(id_venta, idNegocio.toString());
        res.json(detalles);
    }
    catch (error) {
        const errorMessage = error.message || 'Error desconocido';
        res.status(500).json({ message: 'Error al obtener los detalles de venta', errorMessage });
    }
}
