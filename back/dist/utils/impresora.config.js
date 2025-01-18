"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.imprimir = imprimir;
const escpos_1 = __importDefault(require("escpos"));
escpos_1.default.USB = require('escpos-usb');
async function imprimir(req, res) {
    const { contenido } = req.body;
    try {
        const device = new escpos_1.default.USB();
        const printer = new escpos_1.default.Printer(device);
        device.open((err) => {
            if (err) {
                console.error('Error al conectar con la impresora:', err);
                res.status(500).json({ error: 'Error al conectar con la impresora.' });
                return;
            }
            printer
                .text(contenido)
                .cut()
                .close((err) => {
                if (err) {
                    console.error('Error al cerrar la conexión:', err);
                    res.status(500).json({ error: 'Error al cerrar la conexión con la impresora.' });
                }
                else {
                    console.log('Impresión realizada con éxito.');
                    res.json({ message: 'Trabajo de impresión enviado con éxito.' });
                }
            });
        });
    }
    catch (error) {
        console.error('Error al procesar la impresión:', error);
        res.status(500).json({ error: error.message || 'Error interno al procesar la impresión.' });
    }
}
