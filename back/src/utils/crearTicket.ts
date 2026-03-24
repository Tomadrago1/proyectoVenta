import iconv from "iconv-lite";

interface DetalleTicket {
    nombre_producto: string;
    cantidad: number;
    precio_unitario: number;
}

export function crearContenidoTicket(detalles: DetalleTicket[]): string {
    const lineas: string[] = [];

    detalles.forEach((detalle) => {
        const cantidad = Number(detalle.cantidad) || 0;
        const precioUnitario = Number(detalle.precio_unitario) || 0;
        const subtotal = cantidad * precioUnitario;

        lineas.push(`\x1b\x45\x01${detalle.nombre_producto}\x1b\x45\x00`);

        const lineaDetalle = `${cantidad} x $${precioUnitario.toFixed(0)}`;
        const subtotalString = `$${subtotal.toFixed(0)}`;
        const espacioParaSubtotal =
            32 - lineaDetalle.length - subtotalString.length;
        const lineaConSubtotal =
            lineaDetalle +
            " ".repeat(Math.max(0, espacioParaSubtotal)) +
            subtotalString;

        lineas.push(lineaConSubtotal);
    });

    return lineas.join("\n");
}

export function formatearLineaTotal(total: number): string {
    const lineaTotal = `Total:`;
    const totalString = `$${total.toFixed(0)}`;
    const largoTotal = 32;
    const espacioParaTotal = largoTotal - lineaTotal.length - totalString.length;
    return lineaTotal + " ".repeat(Math.max(0, espacioParaTotal)) + totalString;
}
