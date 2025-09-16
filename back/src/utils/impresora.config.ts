import escpos from 'escpos';
import iconv from 'iconv-lite'; // 👈 conversión de caracteres
const USB = require('../vendor/escpos-usb/index.js');

escpos.USB = USB;

import { Request, Response } from 'express';

async function imprimir(req: Request, res: Response): Promise<void> {
  const { contenido, fecha, total } = req.body;

  try {
    const device = new escpos.USB();
    const printer = new escpos.Printer(device);

    (device as any).open((err: any) => {
      if (err) {
        console.error('Error al conectar con la impresora:', err);
        res.status(500).json({ error: 'Error al conectar con la impresora.' });
        return;
      }

      const lineaTotal = `Total:`;
      const totalString = `$${total.toFixed(0)}`;
      const largoTotal = 32;
      const espacioParaTotal =
        largoTotal - lineaTotal.length - totalString.length;
      const lineaConTotal =
        lineaTotal + ' '.repeat(Math.max(0, espacioParaTotal)) + totalString;

      const rawPrinter = printer as any; // 👈 habilitamos métodos no tipados

      // Seleccionamos code page CP850 (multi-lingual: ñ, á, é, í, ó, ú)
      rawPrinter.raw(Buffer.from([0x1b, 0x74, 0x02]));

      // Helper: convierte a CP850 y manda texto
      const printText = (texto: string) => {
        rawPrinter.raw(iconv.encode(texto + '\n', 'CP850'));
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

export { imprimir };
