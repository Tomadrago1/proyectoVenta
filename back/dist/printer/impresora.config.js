"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.test = void 0;
exports.imprimir = imprimir;
const escpos_1 = __importDefault(require("escpos"));
const iconv_lite_1 = __importDefault(require("iconv-lite"));
const USB = require('../vendor/escpos-usb/index.js');
escpos_1.default.USB = USB;
const crearTicket_1 = require("./crearTicket");
async function imprimir(req, res) {
    const { detalles, fecha, total } = req.body;
    try {
        const device = new escpos_1.default.USB();
        const printer = new escpos_1.default.Printer(device);
        device.open((err) => {
            if (err) {
                console.error('Error al conectar con la impresora:', err);
                res.status(500).json({ error: 'Error al conectar con la impresora.' });
                return;
            }
            const contenidoProductos = (0, crearTicket_1.crearContenidoTicket)(detalles);
            const lineaConTotal = (0, crearTicket_1.formatearLineaTotal)(total);
            const rawPrinter = printer;
            rawPrinter.raw(Buffer.from([0x1b, 0x74, 0x02]));
            const printText = (texto) => {
                rawPrinter.raw(iconv_lite_1.default.encode(texto + '\n', 'CP850'));
            };
            printText('CARNES PAMPA');
            printText('ROSARIO - GARZÓN 619 - 2399611');
            printText(`Fecha: ${fecha}`);
            printText('--------------------------------');
            printText('Producto');
            printText('Cant x Precio           Subtotal');
            printText(contenidoProductos);
            printText('--------------------------------');
            printText(lineaConTotal);
            printText('Gracias por su compra\n\n');
            rawPrinter.cut().close((err) => {
                if (err) {
                    console.error('Error al cerrar la conexión:', err);
                    res
                        .status(500)
                        .json({ error: 'Error al cerrar la conexión con la impresora.' });
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
        res.status(500).json({
            error: error.message || 'Error interno al procesar la impresión.',
        });
    }
}
const test = (req, res) => {
    try {
        const device = new escpos_1.default.USB();
        const printer = new escpos_1.default.Printer(device);
        device.open((err) => {
            if (err) {
                console.error('Error al conectar con la impresora:', err);
                res.status(500).json({ error: 'Error al conectar con la impresora.' });
                return;
            }
            const rawPrinter = printer;
            rawPrinter.raw(Buffer.from([0x1b, 0x74, 0x02]));
            rawPrinter.text('Prueba de impresión exitosa\n\n');
            rawPrinter.cut().close((err) => {
                if (err) {
                    console.error('Error al cerrar la conexión:', err);
                    res.status(500).json({ error: 'Error al cerrar la conexión con la impresora.' });
                }
                else {
                    console.log('Prueba de impresión realizada con éxito.');
                    res.json({ message: 'Prueba de impresión realizada con éxito.' });
                }
            });
        });
    }
    catch (error) {
        console.error('Error al procesar la prueba de impresión:', error);
        res.status(500).json({
            error: error.message || 'Error interno al procesar la prueba de impresión.',
        });
    }
};
exports.test = test;
