import escpos from 'escpos';
const USB = require('../vendor/escpos-usb/index.js');

escpos.USB = USB;

const device = new escpos.USB();
const printer = new escpos.Printer(device);

const openDevice = (): Promise<any> => {
  return new Promise((resolve, reject) => {
    (device as any).open((err: any) => {
      if (err) {
        console.error('Error al conectar con la impresora:', err);
        return reject(err);
      }
      resolve(printer);
    });
  });
};

export { openDevice };