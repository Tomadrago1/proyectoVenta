import escpos from 'escpos';
const USB = require('../vendor/escpos-usb/index.js');

escpos.USB = USB;


import { Request, Response } from 'express';

async function imprimir(req: Request, res: Response): Promise<void> {
  const { contenido, fecha, total } = req.body;
  try {
    const device = new escpos.USB();
    const printer = new escpos.Printer(device);

    device.open((err: any) => {
      if (err) {
        console.error('Error al conectar con la impresora:', err);
        res.status(500).json({ error: 'Error al conectar con la impresora.' });
        return;
      }

      const lineaTotal = `Total:`;  // La palabra "Total"
      const totalString = `$${total.toFixed(0)}`;  // El valor del total formateado

      // Establecemos el espacio total para la línea
      const largoTotal = 32;  // Puedes ajustar este número según el ancho que necesites para tu ticket
      const espacioParaTotal = largoTotal - lineaTotal.length - totalString.length;  // Calculamos el espacio restante

      // Creamos la línea con la palabra "Total:" a la izquierda y el total a la derecha
      const lineaConTotal = lineaTotal + " ".repeat(Math.max(0, espacioParaTotal)) + totalString;
      printer
        .text(
          '\x1b\x33\x10' +
          '\x1b\x21\x10' +
          '\x1b\x61\x01' +
          'CARNES PAMPA'.padStart(16 + 'CARNES PAMPA'.length / 2) +
          '\x1b\x61\x00' +
          '\x1b\x21\x00' +
          '\n' +
          '\x1b\x61\x01' +
          'ROSARIO - GARZON 619 - 2399611'.padStart(14 + 'AV.EVA PERON Y GARZON 619 - 2399611'.length / 2) +
          '\x1b\x61\x00' +
          '\n' +
          '\x1b\x61\x01' +
          ('Fecha: ' + fecha).padStart(16 + ('Fecha: ' + fecha).length / 2) +
          '\x1b\x61\x00'
        )
        .text('--------------------------------')
        .text('\x1b\x45\x01Producto\nCant x Precio           Subtotal\x1b\x45\x00')
        .text(contenido)
        .text('--------------------------------')
        .text('\x1b\x61\x01' + lineaConTotal + '\x1b\x61\x00')
        .text('\n' + '\x1b\x61\x01' +
          'Gracias por su compra'.padStart(16 + 'Gracias por su compra'.length / 2) +
          '\x1b\x61\x00')
        .cut()
        .close((err: any) => {
          if (err) {
            console.error('Error al cerrar la conexión:', err);
            res.status(500).json({ error: 'Error al cerrar la conexión con la impresora.' });
          } else {
            console.log('Impresión realizada con éxito.');
            res.json({ message: 'Trabajo de impresión enviado con éxito.' });
          }
        });
    });
  } catch (error) {
    console.error('Error al procesar la impresión:', error);
    res.status(500).json({ error: (error as any).message || 'Error interno al procesar la impresión.' });
  }
}

export { imprimir };