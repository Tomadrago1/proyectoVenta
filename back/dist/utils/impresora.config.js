"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.imprimir = imprimir;
const escpos_1 = __importDefault(require("escpos"));
const iconv_lite_1 = __importDefault(require("iconv-lite")); // 👈 conversión de caracteres
const USB = require('../vendor/escpos-usb/index.js');
escpos_1.default.USB = USB;
async function imprimir(req, res) {
    const { contenido, fecha, total } = req.body;
    try {
        const device = new escpos_1.default.USB();
        const printer = new escpos_1.default.Printer(device);
        device.open((err) => {
            if (err) {
                console.error('Error al conectar con la impresora:', err);
                res.status(500).json({ error: 'Error al conectar con la impresora.' });
                return;
            }
            const lineaTotal = `Total:`;
            const totalString = `$${total.toFixed(0)}`;
            const largoTotal = 32;
            const espacioParaTotal = largoTotal - lineaTotal.length - totalString.length;
            const lineaConTotal = lineaTotal + ' '.repeat(Math.max(0, espacioParaTotal)) + totalString;
            const rawPrinter = printer; // 👈 habilitamos métodos no tipados
            // Seleccionamos code page CP850 (multi-lingual: ñ, á, é, í, ó, ú)
            rawPrinter.raw(Buffer.from([0x1b, 0x74, 0x02]));
            // Helper: convierte a CP850 y manda texto
            const printText = (texto) => {
                rawPrinter.raw(iconv_lite_1.default.encode(texto + '\n', 'CP850'));
            };
            // --- Aquí armamos el ticket ---
            printText('CARNES PAMPA');
            printText('ROSARIO - GARZÓN 619 - 2399611');
            printText(`Fecha: ${fecha}`);
            printText('--------------------------------');
            printText('Producto');
            printText('Cant x Precio           Subtotal');
            printText(contenido);
            printText('--------------------------------');
            printText(lineaConTotal);
            printText('Gracias por su compra');
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
