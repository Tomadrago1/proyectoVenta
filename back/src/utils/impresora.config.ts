import escpos from 'escpos';
escpos.USB = require('escpos-usb');

import { Request, Response } from 'express';

async function imprimir(req: Request, res: Response): Promise<void> {
  const { contenido } = req.body;
  try {
    const device = new escpos.USB();
    const printer = new escpos.Printer(device);

    device.open((err: any) => {
      if (err) {
        console.error('Error al conectar con la impresora:', err);
        res.status(500).json({ error: 'Error al conectar con la impresora.' });
        return;
      }

      printer
        .text(contenido)
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
