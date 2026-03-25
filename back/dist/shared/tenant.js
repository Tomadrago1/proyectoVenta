"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.resolveBusinessId = resolveBusinessId;
exports.resolveBusinessIdFromRequest = resolveBusinessIdFromRequest;
const DEFAULT_BUSINESS_ID = Number.parseInt(process.env.DEFAULT_BUSINESS_ID ?? '1', 10);
function resolveBusinessId(value) {
    const parsed = Number.parseInt(String(value ?? DEFAULT_BUSINESS_ID), 10);
    if (Number.isNaN(parsed) || parsed <= 0) {
        return DEFAULT_BUSINESS_ID;
    }
    return parsed;
}
function resolveBusinessIdFromRequest(req) {
    return resolveBusinessId(req.body?.id_negocio ?? req.query.id_negocio ?? req.header('x-business-id'));
}
