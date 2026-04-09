import escpos from 'escpos';
const USB = require('../vendor/escpos-usb/index.js');

escpos.USB = USB;

const openDevice = (): Promise<any> => {
  return new Promise((resolve, reject) => {
    try {
      const device = new escpos.USB();
      const printer = new escpos.Printer(device);

      (device as any).open((err: any) => {
        if (err) {
          err.message = 'Error al conectar con la impresora';
          console.log(err.message, "Este es el primer error")
          reject(err);
        }
        resolve(printer);
      });
    } catch (error) {
      (error as any).message = 'No se pudo encontrar la impresora USB';
      console.log((error as any).message, "este es el segundo error")
      reject(error);
    }
  });
};

export { openDevice };