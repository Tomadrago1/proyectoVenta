import escpos from 'escpos';
import iconv from 'iconv-lite';
const USB = require('../vendor/escpos-usb/index.js');

escpos.USB = USB;

import { Request, Response } from 'express';
import { crearContenidoTicket, formatearLineaTotal } from './crearTicket';

async function imprimir(req: Request, res: Response): Promise<void> {
  const { detalles, fecha, total } = req.body;

  try {
    const device = new escpos.USB();
    const printer = new escpos.Printer(device);

    (device as any).open((err: any) => {
      if (err) {
        console.error('Error al conectar con la impresora:', err);
        res.status(500).json({ error: 'Error al conectar con la impresora.' });
        return;
      }

      const contenidoProductos = crearContenidoTicket(detalles);
      const lineaConTotal = formatearLineaTotal(total);

      const rawPrinter = printer as any;

      rawPrinter.raw(Buffer.from([0x1b, 0x74, 0x02]));

      const printText = (texto: string) => {
        rawPrinter.raw(iconv.encode(texto + '\n', 'CP850'));
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

      rawPrinter.cut().close((err: any) => {
        if (err) {
          console.error('Error al cerrar la conexión:', err);
          res
            .status(500)
            .json({ error: 'Error al cerrar la conexión con la impresora.' });
        } else {
          console.log('Impresión realizada con éxito.');
          res.json({ message: 'Trabajo de impresión enviado con éxito.' });
        }
      });
    });
  } catch (error) {
    console.error('Error al procesar la impresión:', error);
    res.status(500).json({
      error:
        (error as any).message || 'Error interno al procesar la impresión.',
    });
  }
}

const test = (req: Request, res: Response): void => {
  try {
    const device = new escpos.USB();
    const printer = new escpos.Printer(device);
    (device as any).open((err: any) => {
      if (err) {
        console.error('Error al conectar con la impresora:', err);
        res.status(500).json({ error: 'Error al conectar con la impresora.' });
        return;
      }

      const rawPrinter = printer as any;
      rawPrinter.raw(Buffer.from([0x1b, 0x74, 0x02]));
      rawPrinter.text('Prueba de impresión exitosa\n\n');
      rawPrinter.cut().close((err: any) => {
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
  } catch (error) {
    console.error('Error al procesar la prueba de impresión:', error);
    res.status(500).json({
      error:
        (error as any).message || 'Error interno al procesar la prueba de impresión.',
    });
  }
}


export { imprimir, test };