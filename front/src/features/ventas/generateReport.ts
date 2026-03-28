import api from '../../shared/api/api';
import jsPDF from 'jspdf';
import { DetalleVenta } from '../venta/detalleVenta.interface';
import { Venta } from '../venta/venta.interface';
import { Producto } from '../productos/producto.interface';
import { Usuario } from '../auth/usuario.interface';

// ---------------------------------------------------------
// DATA FETCHERS
// ---------------------------------------------------------
export const getDetallesDeVenta = async (idVenta: number): Promise<DetalleVenta[]> => {
  try {
    const response = await api.get(`/detalle-venta/${idVenta}`);
    return response.data;
  } catch (error) {
    console.error('Error al obtener los detalles de la venta:', error);
    return [];
  }
};

export const getDetallesDeVentaGenerico = async (idVenta: number): Promise<any[]> => {
  try {
    const response = await api.get(`/detalle-venta-generico/${idVenta}`);
    return response.data || [];
  } catch (error) {
    console.error('Error al obtener genéricos:', error);
    return [];
  }
};

export const getProductos = async (): Promise<{ [key: string]: Producto }> => {
  try {
    const response = await api.get('/producto');
    return response.data.reduce((acc: any, p: Producto) => {
      acc[p.id_producto] = p;
      return acc;
    }, {});
  } catch (error) {
    console.error('Error productos:', error);
    return {};
  }
};

export const getUsuario = async (idUsuario: number): Promise<Usuario | null> => {
  try {
    const response = await api.get(`/usuario/${idUsuario}`);
    return response.data;
  } catch (error) {
    console.error('Error usuario:', error);
    return null;
  }
};

// ---------------------------------------------------------
// HELPERS FORMATO & DIBUJO
// ---------------------------------------------------------
const truncateText = (text: string, maxLength: number): string => {
  if (text.length <= maxLength) return text;
  return text.substring(0, maxLength - 3) + '...';
};

// drawCell mejorada
const drawCell = (
  doc: jsPDF, 
  x: number, 
  y: number, 
  width: number, 
  height: number, 
  text: string, 
  align: 'left' | 'center' | 'right' = 'left',
  drawBorders: boolean = true
) => {
  if (drawBorders) {
    doc.rect(x, y, width, height);
  }
  let textX = x + 3;
  if (align === 'center') textX = x + width / 2;
  else if (align === 'right') textX = x + width - 3;
  
  doc.text(text.toString(), textX, y + height / 2 + 1.5, { align });
};

// ---------------------------------------------------------
// REPORTE PRINCIPAL
// ---------------------------------------------------------
export const generateReport = async (ventas: Venta[]) => {
  const doc = new jsPDF('p', 'mm', 'a4');
  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const margin = 15;
  const usableWidth = pageWidth - 2 * margin;

  // CONFIGURACIÓN VISUAL
  const config = {
    cellH: 8,
    headH: 10,
    colors: {
      primary: [30, 41, 59] as [number, number, number], // Slate 800 - corporativo
      text: [51, 65, 85] as [number, number, number],    // Slate 700
      lightText: [100, 116, 139] as [number, number, number], // Slate 500
      border: [203, 213, 225] as [number, number, number],    // Slate 300
      bgAlt: [248, 250, 252] as [number, number, number]     // Slate 50
    },
    cols: [
      { title: 'Producto', w: Math.floor(usableWidth * 0.45) },
      { title: 'Cant.', w: Math.floor(usableWidth * 0.15) },
      { title: 'Precio Unit.', w: Math.floor(usableWidth * 0.2) },
      { title: 'Subtotal', w: usableWidth - Math.floor(usableWidth * 0.45) - Math.floor(usableWidth * 0.15) - Math.floor(usableWidth * 0.2) } 
    ]
  };

  let currentY = margin;

  // TITULO E INFO
  doc.setFontSize(22);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(...config.colors.primary);
  doc.text('REPORTE DE VENTAS', margin, currentY + 10);
  
  doc.setDrawColor(...config.colors.primary);
  doc.setLineWidth(0.5);
  doc.line(margin, currentY + 15, pageWidth - margin, currentY + 15);
  currentY += 22;

  const dateStr = new Date().toLocaleString('es-ES', { dateStyle: 'long', timeStyle: 'short' });
  doc.setFontSize(10);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(...config.colors.lightText);
  doc.text(`Generado el: ${dateStr}`, margin, currentY);
  doc.text(`Cantidad de Ventas: ${ventas.length}`, pageWidth - margin, currentY, { align: 'right' });
  currentY += 15;

  // --- CARGA DE DATOS OPTIMIZADA (Promise.All) ---
  const productos = await getProductos();
  
  const usuariosSet = new Set(ventas.map(v => v.id_usuario).filter(id => id !== null));
  const usuariosCache: Record<number, Usuario> = {};
  await Promise.all(Array.from(usuariosSet).map(async (id) => {
      const u = await getUsuario(id!);
      if(u) usuariosCache[id!] = u;
  }));

  const ventasFull = await Promise.all(ventas.map(async (venta) => {
    if (!venta.id_venta) return { venta, detalles: [] };
    const [norm, gen] = await Promise.all([
      getDetallesDeVenta(venta.id_venta),
      getDetallesDeVentaGenerico(venta.id_venta)
    ]);
    const adaptados = gen.map((g: any) => ({
      id_producto: 0,
      cantidad: g.cantidad,
      precio_unitario: g.precio_unitario,
      is_generico: true,
      descripcion: g.descripcion
    }));
    return { venta, detalles: [...norm, ...adaptados] };
  }));

  let totalGeneral = 0;

  // HELPER INTERNO: Dibujar Cabeceras de Tabla
  const drawHeaders = (yPos: number) => {
    doc.setFillColor(...config.colors.primary);
    doc.rect(margin, yPos, usableWidth, config.headH, 'F');
    doc.setTextColor(255, 255, 255);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(9);
    
    let cx = margin;
    config.cols.forEach(col => {
      drawCell(doc, cx, yPos, col.w, config.headH, col.title, 'center', false);
      cx += col.w;
    });
    return yPos + config.headH;
  };

  // --- DIBUJADO DE CADA VENTA ---
  for (const item of ventasFull) {
    const { venta, detalles } = item;
    const vendedor = venta.id_usuario ? usuariosCache[venta.id_usuario] : null;

    if (currentY + 45 > pageHeight - margin) {
      doc.addPage();
      currentY = margin;
    }

    // Cabezal Venta
    doc.setFillColor(...config.colors.bgAlt);
    doc.setDrawColor(...config.colors.border);
    doc.setLineWidth(0.3);
    doc.roundedRect(margin, currentY, usableWidth, 22, 2, 2, 'FD');

    doc.setFontSize(12);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(...config.colors.primary);
    doc.text(`Venta #${venta.id_venta}`, margin + 5, currentY + 8);

    doc.setFontSize(9);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(...config.colors.text);
    const fVenta = new Date(venta.fecha_venta).toLocaleString('es-ES', { dateStyle: 'short', timeStyle: 'short' });
    doc.text(`Fecha: ${fVenta}`, margin + 5, currentY + 14);
    if(vendedor) doc.text(`Cajero: ${vendedor.nombre} ${vendedor.apellido}`, margin + 5, currentY + 19);

    currentY += 26;

    if (detalles.length > 0) {
      currentY = drawHeaders(currentY);
      
      doc.setTextColor(...config.colors.text);
      doc.setFont("helvetica", "normal");
      doc.setFontSize(8.5);
      doc.setDrawColor(...config.colors.border);
      doc.setLineWidth(0.1);

      detalles.forEach((d: any, idx) => {
        // Paginación interna de tabla
        if (currentY + config.cellH > pageHeight - margin - 20) {
          doc.addPage();
          currentY = margin;
          currentY = drawHeaders(currentY);
          doc.setTextColor(...config.colors.text);
          doc.setFont("helvetica", "normal");
        }

        if (idx % 2 === 0) {
          doc.setFillColor(...config.colors.bgAlt);
          doc.rect(margin, currentY, usableWidth, config.cellH, 'F');
        }

        const nombre = d.is_generico ? d.descripcion : (productos[d.id_producto]?.nombre_producto || 'Desc.');
        const cX = margin;
        
        drawCell(doc, cX, currentY, config.cols[0].w, config.cellH, truncateText(nombre, 40), 'left', true);
        drawCell(doc, cX + config.cols[0].w, currentY, config.cols[1].w, config.cellH, d.cantidad.toString(), 'center', true);
        drawCell(doc, cX + config.cols[0].w + config.cols[1].w, currentY, config.cols[2].w, config.cellH, `$${Number(d.precio_unitario).toFixed(0)}`, 'right', true);
        drawCell(doc, cX + usableWidth - config.cols[3].w, currentY, config.cols[3].w, config.cellH, `$${(d.cantidad * d.precio_unitario).toFixed(0)}`, 'right', true);
        
        currentY += config.cellH;
      });
    }

    // Totales Módulo
    currentY += 4;
    doc.setFont("helvetica", "bold");
    doc.setFontSize(11);
    doc.setTextColor(...config.colors.primary);
    
    const tVenta = Number(venta.total);
    doc.text(`TOTAL: $${tVenta.toLocaleString('es-ES')}`, pageWidth - margin, currentY + 5, { align: 'right' });
    
    totalGeneral += tVenta;
    currentY += 15;
    
    // Separador entre ventas
    doc.setDrawColor(...config.colors.border);
    doc.line(margin + 20, currentY, usableWidth - 20, currentY);
    currentY += 8;
  }

  // --- RESUMEN FINAL ---
  if (ventas.length > 1) {
    if (currentY + 30 > pageHeight - margin) { doc.addPage(); currentY = margin + 10; }
    
    doc.setFillColor(...config.colors.primary);
    doc.roundedRect(margin, currentY, usableWidth, 20, 2, 2, 'F');
    
    doc.setTextColor(255, 255, 255);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(14);
    doc.text('RESUMEN GENERAL', margin + 10, currentY + 12);
    doc.text(`TOTAL: $${totalGeneral.toLocaleString('es-ES')}`, pageWidth - margin - 10, currentY + 12, { align: 'right' });
  }

  // --- PIE DE PAGINA (Para todas las páginas generadas) ---
  const totalPags = doc.getNumberOfPages();
  for (let i = 1; i <= totalPags; i++) {
    doc.setPage(i);
    doc.setTextColor(...config.colors.lightText);
    doc.setFont("helvetica", "italic");
    doc.setFontSize(8);
    doc.text('Generado por Sistema de Ventas', margin, pageHeight - 8);
    doc.text(`Página ${i} de ${totalPags}`, pageWidth - margin, pageHeight - 8, { align: 'right' });
  }

  const fd = new Date().toISOString().replace(/[:.]/g, '-').slice(0,19);
  doc.save(`Reporte_Ventas_${fd}.pdf`);
};
