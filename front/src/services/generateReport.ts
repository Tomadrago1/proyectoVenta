import axios from 'axios';
import jsPDF from 'jspdf';
import { DetalleVenta } from '../interface/detalleVenta';
import { Venta } from '../interface/venta';
import { Producto } from '../interface/producto';
import { Usuario } from '../interface/usuario';

export const getDetallesDeVenta = async (idVenta: number): Promise<DetalleVenta[]> => {
  try {
    const response = await axios.get(`/api/detalle-venta/${idVenta}`);
    return response.data;
  } catch (error) {
    console.error('Error al obtener los detalles de la venta:', error);
    return [];
  }
};

export const getProductos = async (): Promise<{ [key: string]: Producto }> => {
  try {
    const response = await axios.get('/api/producto');
    const productos = response.data.reduce((acc: { [key: string]: Producto }, producto: Producto) => {
      acc[producto.id_producto] = producto;
      return acc;
    }, {});
    return productos;
  } catch (error) {
    console.error('Error al obtener los productos:', error);
    return {};
  }
};

export const getUsuario = async (idUsuario: number): Promise<Usuario | null> => {
  try {
    const response = await axios.get(`/api/usuario/${idUsuario}`);
    return response.data;
  } catch (error) {
    console.error('Error al obtener el usuario:', error);
    return null;
  }
};

export const generateReport = async (ventas: Venta[]) => {
  const doc = new jsPDF();

  doc.setFontSize(18);
  doc.text('Reporte de Ventas', 14, 20);

  const date = new Date().toLocaleString('es-ES', { hour12: false });
  doc.setFontSize(12);
  doc.text(`Fecha de Generación: ${date}`, 14, 30);

  let currentY = 50;
  doc.setFontSize(12);
  doc.setTextColor(0, 0, 0);

  const headers = ['Producto', 'Cantidad', 'Precio Unitario', 'Subtotal'];
  const cellWidth = 45;
  const startX = 14;
  const rowHeight = 10;

  const productos = await getProductos();

  for (let venta of ventas) {
    let detallesDeVenta: DetalleVenta[] = [];
    let usuario: Usuario | null = null;

    if (venta.id_venta !== null) {
      detallesDeVenta = await getDetallesDeVenta(venta.id_venta);
      usuario = await getUsuario(venta.id_usuario);
    }

    if (currentY + rowHeight * 5 > 280) {
      doc.addPage();
      currentY = 20;
    }

    doc.setFontSize(14);
    doc.text(`Venta #${venta.id_venta}`, 14, currentY);
    currentY += 10;

    if (usuario) {
      doc.setFontSize(10);
      doc.setFont("helvetica", "bold");
      doc.text(`Vendido por: ${usuario.nombre} ${usuario.apellido}`, 14, currentY);
      currentY += 10;
    }

    doc.setFont("helvetica", "bold");
    doc.text(`Fecha: ${new Date(venta.fecha_venta).toLocaleString('es-ES', { hour12: false })}`, 14, currentY);
    currentY += 15;

    const yTableStart = currentY;
    doc.setFontSize(10);
    doc.setTextColor(0, 0, 0);

    doc.setFont("helvetica", "bold");
    headers.forEach((header, i) => {
      doc.text(header, startX + i * cellWidth, yTableStart);
    });

    let tableHeight = 0;
    detallesDeVenta.forEach((detalle: DetalleVenta, index: number) => {
      const y = yTableStart + rowHeight * (index + 1);
      tableHeight = y - yTableStart;

      doc.setFont("helvetica", "normal");
      doc.text(
        productos[detalle.id_producto]?.nombre_producto || 'Producto Desconocido',
        startX,
        y
      );
      doc.text(detalle.cantidad.toString(), startX + cellWidth, y);
      doc.text(
        `$${detalle.precio_unitario}`,
        startX + cellWidth * 2,
        y
      );
      doc.text(
        `$${(detalle.cantidad * detalle.precio_unitario).toFixed(0)}`,
        startX + cellWidth * 3,
        y
      );
    });

    const tableBottom = yTableStart + tableHeight + rowHeight + 5;
    const borderMargin = 5;
    doc.rect(startX - borderMargin, yTableStart - rowHeight, cellWidth * 4 + 2 * borderMargin, tableBottom - yTableStart + 10);

    currentY = tableBottom + 10;

    doc.setFontSize(12);
    doc.setFont("helvetica", "bold");
    doc.text(`Monto Extra: $${venta.monto_extra !== undefined && venta.monto_extra !== null ? venta.monto_extra : 0}`, 14, currentY);
    currentY += 10;

    currentY += rowHeight;
    doc.setFontSize(16);
    doc.setFont("helvetica", "bold");
    doc.text(`Total Venta: $${venta.total}`, startX + cellWidth * 2, currentY);

    currentY += rowHeight + 10;
  }

  const formattedDate = new Date().toLocaleDateString('es-ES', { day: '2-digit', month: '2-digit', year: 'numeric' }).replace(/\//g, '-') + '_' + new Date().toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' }).replace(/:/g, '-');
  doc.save(`reporte_ventas_${formattedDate}.pdf`);
};
