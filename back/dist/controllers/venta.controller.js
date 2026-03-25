"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.findAll = findAll;
exports.findOne = findOne;
exports.create = create;
exports.update = update;
exports.remove = remove;
exports.filterByDateRange = filterByDateRange;
const venta_repository_1 = require("../repositories/venta.repository");
const venta_model_1 = require("../models/venta.model");
const tenant_1 = require("../shared/tenant");
const repository = new venta_repository_1.VentaRepository();
async function findAll(req, res) {
    try {
        const idNegocio = (0, tenant_1.resolveBusinessIdFromRequest)(req);
        const ventas = await repository.findAll(idNegocio);
        res.json(ventas);
    }
    catch (error) {
        res.status(500).json({ message: 'Error al obtener las ventas', errorMessage: error.message });
    }
}
async function findOne(req, res) {
    try {
        const { id } = req.params;
        const idNegocio = (0, tenant_1.resolveBusinessIdFromRequest)(req);
        const venta = await repository.findOne({ id, id_negocio: idNegocio.toString() });
        if (venta) {
            res.json(venta);
        }
        else {
            res.status(404).json({ message: 'Venta no encontrada' });
        }
    }
    catch (error) {
        res.status(500).json({ message: 'Error al obtener la venta', errorMessage: error.message });
    }
}
async function create(req, res) {
    try {
        const idNegocio = (0, tenant_1.resolveBusinessIdFromRequest)(req);
        const venta = new venta_model_1.Venta(idNegocio, req.body.id_usuario, null, req.body.total, new Date(req.body.fecha_venta), req.body.monto_extra);
        const result = await repository.save(venta);
        res.json(result);
    }
    catch (error) {
        res.status(500).json({ message: 'Error al crear la venta', errorMessage: error.message });
    }
}
async function update(req, res) {
    try {
        const { id } = req.params;
        const idNegocio = (0, tenant_1.resolveBusinessIdFromRequest)(req);
        const venta = new venta_model_1.Venta(idNegocio, req.body.id_usuario, parseInt(id), req.body.total, new Date(req.body.fecha_venta), req.body.monto_extra);
        const result = await repository.update({ id, id_negocio: idNegocio.toString() }, venta);
        res.json(result);
    }
    catch (error) {
        res.status(500).json({ message: 'Error al actualizar la venta', errorMessage: error.message });
    }
}
async function remove(req, res) {
    try {
        const { id } = req.params;
        const idNegocio = (0, tenant_1.resolveBusinessIdFromRequest)(req);
        await repository.remove({ id, id_negocio: idNegocio.toString() });
        res.json({ message: 'Venta eliminada' });
    }
    catch (error) {
        res.status(500).json({ message: 'Error al eliminar la venta', errorMessage: error.message });
    }
}
async function filterByDateRange(req, res) {
    try {
        const { startDate, endDate } = req.query;
        const idNegocio = (0, tenant_1.resolveBusinessIdFromRequest)(req);
        if (!startDate || !endDate) {
            res.status(400).json({ message: 'Debe proporcionar startDate y endDate' });
            return;
        }
        const ventas = await repository.filterByDateRange(new Date(startDate), new Date(endDate), idNegocio);
        res.status(200).json(ventas);
    }
    catch (error) {
        res.status(500).json({ message: 'Error al filtrar ventas por rango de fechas', error: error.message });
    }
}
