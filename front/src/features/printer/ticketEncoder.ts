/**
 * ticketEncoder.ts
 * 
 * Genera los bytes ESC/POS para un ticket de venta.
 * Migración de la lógica del backend (ticketFormato.ts) al frontend.
 * 
 * Utiliza directamente bytes ESC/POS sin dependencias externas.
 */

import { DetalleTicket, NegocioTicket } from './printerConfig.interface';

// ── Codepage CP850 mapping (latin chars con acentos y ñ) ─────────
// Mapeamos los caracteres especiales del español a CP850
const CP850_MAP: Record<string, number> = {
  'á': 0xA0, 'é': 0x82, 'í': 0xA1, 'ó': 0xA2, 'ú': 0xA3,
  'Á': 0xB5, 'É': 0x90, 'Í': 0xD6, 'Ó': 0xE0, 'Ú': 0xE9,
  'ñ': 0xA4, 'Ñ': 0xA5,
  'ü': 0x81, 'Ü': 0x9A,
  '¡': 0xAD, '¿': 0xA8,
  '°': 0xF8,
};

/**
 * Convierte un string a bytes CP850 para impresoras térmicas.
 */
function encodeCP850(text: string): Uint8Array {
  const bytes: number[] = [];
  for (const char of text) {
    if (CP850_MAP[char] !== undefined) {
      bytes.push(CP850_MAP[char]);
    } else {
      const code = char.charCodeAt(0);
      bytes.push(code <= 0xFF ? code : 0x3F); // '?' para caracteres fuera de rango
    }
  }
  return new Uint8Array(bytes);
}

/**
 * Utilidades ESC/POS como constantes de bytes.
 */
const ESC = 0x1B;
const GS = 0x1D;

const CMD = {
  INIT:         new Uint8Array([ESC, 0x40]),           // Initialize printer
  CODEPAGE_850: new Uint8Array([ESC, 0x74, 0x02]),     // Set Code Page CP850
  ALIGN_CENTER: new Uint8Array([ESC, 0x61, 0x01]),     // Center alignment
  ALIGN_LEFT:   new Uint8Array([ESC, 0x61, 0x00]),     // Left alignment
  BOLD_ON:      new Uint8Array([ESC, 0x45, 0x01]),     // Bold on
  BOLD_OFF:     new Uint8Array([ESC, 0x45, 0x00]),     // Bold off
  CUT:          new Uint8Array([GS, 0x56, 0x00]),      // Full cut
  FEED_3:       new Uint8Array([ESC, 0x64, 0x03]),     // Feed 3 lines
};

/**
 * Concatena múltiples Uint8Array en uno solo.
 */
function concat(...arrays: Uint8Array[]): Uint8Array {
  const totalLength = arrays.reduce((sum, arr) => sum + arr.length, 0);
  const result = new Uint8Array(totalLength);
  let offset = 0;
  for (const arr of arrays) {
    result.set(arr, offset);
    offset += arr.length;
  }
  return result;
}

/**
 * Convierte texto a bytes CP850 con salto de línea.
 */
function textLine(text: string): Uint8Array {
  return concat(encodeCP850(text), new Uint8Array([0x0A]));
}

/**
 * Genera el contenido de productos en formato columnar.
 */
function crearContenidoProductos(detalles: DetalleTicket[], maxCols: number): Uint8Array {
  const parts: Uint8Array[] = [];

  for (const detalle of detalles) {
    const cantidad = Number(detalle.cantidad) || 0;
    const precioUnitario = Number(detalle.precio_unitario) || 0;
    const subtotal = cantidad * precioUnitario;
    const nombreProducto = detalle.nombre_producto || 'Producto Genérico';

    // Nombre en negrita
    parts.push(CMD.BOLD_ON);
    parts.push(textLine(nombreProducto));
    parts.push(CMD.BOLD_OFF);

    // Detalle: cantidad x precio  subtotal
    const lineaDetalle = `${cantidad} x $${precioUnitario.toFixed(0)}`;
    const subtotalStr = `$${subtotal.toFixed(0)}`;
    const espacios = Math.max(0, maxCols - lineaDetalle.length - subtotalStr.length);
    parts.push(textLine(lineaDetalle + ' '.repeat(espacios) + subtotalStr));
  }

  return concat(...parts);
}

/**
 * Formatea la línea del total.
 */
function formatearLineaTotal(total: number, maxCols: number): string {
  const lineaTotal = 'TOTAL:';
  const totalStr = `$${total.toFixed(0)}`;
  const espacios = Math.max(0, maxCols - lineaTotal.length - totalStr.length);
  return lineaTotal + ' '.repeat(espacios) + totalStr;
}

/**
 * Genera los bytes ESC/POS completos para un ticket de venta.
 */
export function encodeTicket(
  detalles: DetalleTicket[],
  negocio: NegocioTicket,
  fecha: string,
  total: number,
  columnas: number = 48,
): Uint8Array {
  const separadorDoble = '='.repeat(columnas);
  const separadorSimple = '-'.repeat(columnas);

  // Encabezado de columnas (ajustado al ancho)
  const headerCant = 'CANT x PRECIO';
  const headerSub = 'SUBTOTAL';
  const headerEspacios = Math.max(0, columnas - headerCant.length - headerSub.length);
  const lineaHeader = headerCant + ' '.repeat(headerEspacios) + headerSub;

  return concat(
    // Inicialización
    CMD.INIT,
    CMD.CODEPAGE_850,

    // ═══ HEADER (Centrado) ═══
    CMD.ALIGN_CENTER,
    CMD.BOLD_ON,
    textLine((negocio.nombre_negocio || '').toUpperCase()),
    CMD.BOLD_OFF,
    textLine(negocio.direccion || ''),
    textLine(negocio.ciudad || ''),
    textLine(`Tel: ${negocio.telefono || ''}`),
    textLine(separadorDoble),

    // ═══ CUERPO (Izquierda) ═══
    CMD.ALIGN_LEFT,
    textLine(`FECHA: ${fecha}`),
    textLine(separadorSimple),
    textLine(lineaHeader),
    textLine(separadorSimple),

    // Lista de productos
    crearContenidoProductos(detalles, columnas),

    textLine(separadorSimple),

    // ═══ TOTAL ═══
    CMD.BOLD_ON,
    textLine(formatearLineaTotal(total, columnas)),
    CMD.BOLD_OFF,
    textLine(separadorDoble),

    // ═══ FOOTER (Centrado) ═══
    CMD.ALIGN_CENTER,
    textLine('¡GRACIAS POR SU COMPRA!'),
    textLine('Vuelva pronto'),

    // Feed y corte
    CMD.FEED_3,
    CMD.CUT,
  );
}

/**
 * Genera un ticket de prueba simple.
 */
export function encodeTestTicket(columnas: number = 48): Uint8Array {
  const separador = '='.repeat(columnas);

  return concat(
    CMD.INIT,
    CMD.CODEPAGE_850,
    CMD.ALIGN_CENTER,
    CMD.BOLD_ON,
    textLine('PRUEBA DE IMPRESION'),
    CMD.BOLD_OFF,
    textLine(separador),
    textLine('Si puedes leer esto,'),
    textLine('la impresora esta configurada'),
    textLine('correctamente.'),
    textLine(separador),
    textLine(`Fecha: ${new Date().toLocaleString('es-ES', { hour12: false })}`),
    textLine(`Columnas: ${columnas}`),
    textLine(''),
    CMD.FEED_3,
    CMD.CUT,
  );
}
