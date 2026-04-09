import { Request, Response } from 'express';
import { openDevice } from './impresora.config';
import { ejecutarImpresion } from './ticketFormato';
import { obtenerDetallesConProductos, obtenerNegocio } from './printer.repository';
import { resolveBusinessIdFromRequest } from '../shared/tenant';


async function imprimir_ticket(req: Request, res: Response): Promise<void> {
    const idNegocio = resolveBusinessIdFromRequest(req);
    const { id_venta, fecha, total, genericos } = req.body;
    try {
        const printer = await openDevice();
        if (!printer) {
            throw new Error('No se pudo encontrar la impresora USB');
        }
        const rawPrinter = printer as any;
        const detalles = await obtenerDetallesConProductos(id_venta, idNegocio);

        if (genericos && Array.isArray(genericos)) {
            genericos.forEach((gen: any) => {
                detalles.push({
                    cantidad: gen.cantidad,
                    precio_unitario: Number(gen.precio_unitario),
                    nombre_producto: 'Producto Genérico'
                });
            });
        }

        const negocio = await obtenerNegocio(idNegocio);
        const imprimirTicket = await ejecutarImpresion(rawPrinter, detalles, negocio, fecha, total);
        res.status(200).json({ message: 'Ticket impreso exitosamente.' });
        console.log('Ticket impreso exitosamente.');
    } catch (error) {

        console.log((error as any).message, "este es el error en controller")

        res.status(500).json({
            error:
                (error as any).message || 'Error interno al procesar la impresión.',
        });
    }
}

const test = async (req: Request, res: Response): Promise<void> => {
    try {
        const printer = await openDevice();
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
    } catch (error) {
        console.error('Error al procesar la prueba de impresión:', error);
        res.status(500).json({
            error:
                (error as any).message || 'Error interno al procesar la prueba de impresión.',
        });
    }
}
export { imprimir_ticket, test };