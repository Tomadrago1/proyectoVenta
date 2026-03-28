// ticketFormato.ts
import iconv from "iconv-lite";
import { DetalleTicket, Negocio } from "./printer.repository";

const MAX_COLUMNAS = 32;

export function crearContenidoTicket(detalles: DetalleTicket[]): string {
    const lineas: string[] = [];

    detalles.forEach((detalle) => {
        const cantidad = Number(detalle.cantidad) || 0;
        const precioUnitario = Number(detalle.precio_unitario) || 0;
        const subtotal = cantidad * precioUnitario;
        const nombreProducto = detalle.nombre_producto || 'Producto Genérico';
        
        // El nombre en negrita
        lineas.push(`\x1b\x45\x01${nombreProducto}\x1b\x45\x00`);
        
        const lineaDetalle = `${cantidad} x $${precioUnitario.toFixed(0)}`;
        const subtotalString = `$${subtotal.toFixed(0)}`;
        const espacioParaSubtotal = MAX_COLUMNAS - lineaDetalle.length - subtotalString.length;

        const lineaConSubtotal = lineaDetalle + " ".repeat(Math.max(0, espacioParaSubtotal)) + subtotalString;
        lineas.push(lineaConSubtotal);
    });

    return lineas.join("\n");
}

export function formatearLineaTotal(total: any): string {
    const numTotal = Number(total);
    const lineaTotal = `TOTAL:`;
    const totalString = `$${numTotal.toFixed(0)}`;
    const espacioParaTotal = MAX_COLUMNAS - lineaTotal.length - totalString.length;
    return lineaTotal + " ".repeat(Math.max(0, espacioParaTotal)) + totalString;
}

export const ejecutarImpresion = (printer: any, detalles: DetalleTicket[], negocio: Negocio, fecha: string, total: any): Promise<void> => {
    return new Promise((resolve, reject) => {
        const rawPrinter = printer as any;
        
        const printText = (texto: string) => {
            rawPrinter.raw(iconv.encode(texto + '\n', 'CP850'));
        };

        const printCmd = (comando: number[]) => {
            rawPrinter.raw(Buffer.from(comando));
        };

        const contenidoProductos = crearContenidoTicket(detalles);
        const lineaConTotal = formatearLineaTotal(total);
        
        // 1. Iniciar Code Page para Acentos y Ñ
        printCmd([0x1b, 0x74, 0x02]); 

        // === HEADER (Centrado) ===
        printCmd([0x1B, 0x61, 0x01]); // Alinear al centro
        
        printCmd([0x1B, 0x45, 0x01]); // Activar Negrita
        printText((negocio.nombre_negocio || '').toUpperCase());
        printCmd([0x1B, 0x45, 0x00]); // Desactivar Negrita
        
        printText(negocio.direccion || '');
        printText(negocio.ciudad || '');
        printText(`Tel: ${negocio.telefono || ''}`);
        printText('================================'); // Separador doble

        // === CUERPO (Alineado izquierda) ===
        printCmd([0x1B, 0x61, 0x00]); // Alinear a la izquierda
        printText(`FECHA: ${fecha}`);
        printText('--------------------------------'); // Separador simple
        printText('CANT x PRECIO           SUBTOTAL');
        printText('--------------------------------');
        
        // Imprimir lista de productos
        printText(contenidoProductos);
        
        printText('--------------------------------');
        
        // === TOTAL (Negrita) ===
        printCmd([0x1B, 0x45, 0x01]); // Activar Negrita
        printText(lineaConTotal);
        printCmd([0x1B, 0x45, 0x00]); // Desactivar Negrita
        
        printText('================================\n');

        // === FOOTER (Centrado) ===
        printCmd([0x1B, 0x61, 0x01]); // Alinear al centro
        printText('¡GRACIAS POR SU COMPRA!');
        printText('Vuelva pronto\n\n\n'); // Espacio extra para el corte

        // Cortar y Cerrar
        rawPrinter.cut().close((err: any) => {
            if (err) {
                console.error('Error al cerrar la conexión:', err);
                return reject(err);
            }
            resolve();
        });
    });
};