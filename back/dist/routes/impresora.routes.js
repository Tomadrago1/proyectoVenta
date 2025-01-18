"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.routerImpresora = void 0;
const express_1 = require("express");
const impresora_config_1 = require("../utils/impresora.config");
exports.routerImpresora = (0, express_1.Router)();
exports.routerImpresora.post('/imprimir', impresora_config_1.imprimir);
