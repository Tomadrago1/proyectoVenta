// ticketFormato.ts
import iconv from "iconv-lite";

export function crearContenidoTicket(detalles: any[]): string {
    const lineas: string[] = [];

    detalles.forEach((detalle) => {
        const cantidad = Number(detalle.cantidad) || 0;
        const precioUnitario = Number(detalle.precio_unitario) || 0;
        const subtotal = cantidad * precioUnitario;
        const nombreProducto = detalle.nombre_producto || 'Producto Genérico';
        lineas.push(`\x1b\x45\x01${nombreProducto}\x1b\x45\x00`);
        const lineaDetalle = `${cantidad} x $${precioUnitario.toFixed(0)}`;
        const subtotalString = `$${subtotal.toFixed(0)}`;
        const espacioParaSubtotal = 32 - lineaDetalle.length - subtotalString.length;

        const lineaConSubtotal = lineaDetalle + " ".repeat(Math.max(0, espacioParaSubtotal)) + subtotalString;
        lineas.push(lineaConSubtotal);
    });

    return lineas.join("\n");
}

export function formatearLineaTotal(total: number): string {
    const lineaTotal = `Total:`;
    const totalString = `$${total.toFixed(0)}`;
    const espacioParaTotal = 32 - lineaTotal.length - totalString.length;
    return lineaTotal + " ".repeat(Math.max(0, espacioParaTotal)) + totalString;
}

export const ejecutarImpresion = (printer: any, detalles: any[], negocio: any, fecha: string, total: number): Promise<void> => {
    return new Promise((resolve, reject) => {
        const rawPrinter = printer as any;
        const printText = (texto: string) => {
            rawPrinter.raw(iconv.encode(texto + '\n', 'CP850'));
        };

        const contenidoProductos = crearContenidoTicket(detalles);
        const lineaConTotal = formatearLineaTotal(total);
        rawPrinter.raw(Buffer.from([0x1b, 0x74, 0x02]));

        printText(negocio.nombre_negocio);
        printText(negocio.ciudad + ' - ' + negocio.direccion + ' - ' + negocio.telefono);
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
                return reject(err);
            }
            resolve();
        });
    });
};