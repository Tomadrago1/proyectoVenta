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

// Función auxiliar para truncar texto largo
const truncateText = (text: string, maxLength: number): string => {
  if (text.length <= maxLength) return text;
  return text.substring(0, maxLength - 3) + '...';
};

// Función auxiliar para dividir texto en múltiples líneas
const splitText = (doc: jsPDF, text: string, maxWidth: number): string[] => {
  return doc.splitTextToSize(text, maxWidth);
};

// Función auxiliar para dibujar una celda con bordes
const drawCell = (doc: jsPDF, x: number, y: number, width: number, height: number, text: string, align: 'left' | 'center' | 'right' = 'left') => {
  // Dibujar borde de la celda
  doc.rect(x, y, width, height);
  
  // Calcular posición del texto según alineación
  let textX = x + 2; // padding izquierdo por defecto
  if (align === 'center') {
    textX = x + width / 2;
  } else if (align === 'right') {
    textX = x + width - 2; // padding derecho
  }
  
  // Dibujar texto
  doc.text(text, textX, y + height / 2 + 2, { align });
};

export const generateReport = async (ventas: Venta[]) => {
  const doc = new jsPDF('p', 'mm', 'a4');
  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const margin = 15;
  const usableWidth = pageWidth - 2 * margin;

  // Configuración de la tabla
  const tableConfig = {
    startX: margin,
    cellHeight: 10,
    headerHeight: 12,
    columns: [
      { title: 'Producto', width: Math.floor(usableWidth * 0.4) }, // 40% del ancho
      { title: 'Cantidad', width: Math.floor(usableWidth * 0.15) },   // 15% del ancho
      { title: 'Precio Unit.', width: Math.floor(usableWidth * 0.2) }, // 20% del ancho
      { title: 'Subtotal', width: Math.floor(usableWidth * 0.25) } // 25% del ancho
    ]
  };

  // Debug: verificar que los anchos sumen correctamente
  const totalWidth = tableConfig.columns.reduce((sum, col) => sum + col.width, 0);
  console.log(`Ancho usable: ${usableWidth}, Total columnas: ${totalWidth}`);

  let currentY = margin;

  // === ENCABEZADO DEL REPORTE ===
  // Título principal
  doc.setFontSize(20);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(33, 37, 41); // Color gris oscuro
  doc.text('REPORTE DE VENTAS', pageWidth / 2, currentY + 10, { align: 'center' });
  
  // Línea decorativa
  doc.setDrawColor(0, 123, 255); // Color azul
  doc.setLineWidth(1);
  doc.line(margin, currentY + 15, pageWidth - margin, currentY + 15);
  
  currentY += 25;

  // Información del reporte
  const date = new Date().toLocaleString('es-ES', { 
    year: 'numeric', 
    month: 'long', 
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
  
  doc.setFontSize(11);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(108, 117, 125); // Color gris
  doc.text(`Fecha de generación: ${date}`, margin, currentY);
  doc.text(`Total de ventas: ${ventas.length}`, pageWidth - margin, currentY, { align: 'right' });
  
  currentY += 15;

  // Obtener datos necesarios
  const productos = await getProductos();
  let totalGeneral = 0;
  let totalMontoExtra = 0;

  // === PROCESAMIENTO DE VENTAS ===
  for (let ventaIndex = 0; ventaIndex < ventas.length; ventaIndex++) {
    const venta = ventas[ventaIndex];
    let detallesDeVenta: DetalleVenta[] = [];
    let usuario: Usuario | null = null;

    if (venta.id_venta !== null) {
      detallesDeVenta = await getDetallesDeVenta(venta.id_venta);
      usuario = await getUsuario(venta.id_usuario);
    }

    // Verificar si necesitamos una nueva página
    const estimatedHeight = 40 + (detallesDeVenta.length * tableConfig.cellHeight) + 30;
    if (currentY + estimatedHeight > pageHeight - margin) {
      doc.addPage();
      currentY = margin;
    }

    // === INFORMACIÓN DE LA VENTA ===
    // Fondo para el encabezado de la venta
    doc.setFillColor(248, 249, 250); // Gris muy claro
    doc.rect(margin, currentY, usableWidth, 25, 'F');
    
    doc.setFontSize(14);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(33, 37, 41);
    doc.text(`Venta #${venta.id_venta}`, margin + 5, currentY + 8);
    
    doc.setFontSize(10);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(108, 117, 125);
    const fechaVenta = new Date(venta.fecha_venta).toLocaleString('es-ES', { 
      day: '2-digit',
      month: '2-digit', 
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
    doc.text(`Fecha: ${fechaVenta}`, margin + 5, currentY + 16);
    
    if (usuario) {
      doc.text(`Vendedor: ${usuario.nombre} ${usuario.apellido}`, margin + 5, currentY + 22);
    }
    
    currentY += 30;

    // === TABLA DE PRODUCTOS ===
    if (detallesDeVenta.length > 0) {
      // Dibujar fondo completo de los encabezados
      doc.setFillColor(0, 123, 255); // Azul
      doc.rect(tableConfig.startX, currentY, usableWidth, tableConfig.headerHeight, 'F');
      
      // Configurar texto de encabezados
      doc.setTextColor(255, 255, 255); // Blanco
      doc.setFont("helvetica", "bold");
      doc.setFontSize(10);
      
      // Dibujar bordes y texto de cada columna
      let currentX = tableConfig.startX;
      
      // Columna Producto
      doc.setDrawColor(255, 255, 255); // Borde blanco para separar columnas
      doc.setLineWidth(0.5);
      doc.rect(currentX, currentY, tableConfig.columns[0].width, tableConfig.headerHeight);
      doc.text('Producto', currentX + (tableConfig.columns[0].width / 2), currentY + 8, { align: 'center' });
      currentX += tableConfig.columns[0].width;
      
      // Columna Cantidad
      doc.rect(currentX, currentY, tableConfig.columns[1].width, tableConfig.headerHeight);
      doc.text('Cantidad', currentX + (tableConfig.columns[1].width / 2), currentY + 8, { align: 'center' });
      currentX += tableConfig.columns[1].width;
      
      // Columna Precio Unitario
      doc.rect(currentX, currentY, tableConfig.columns[2].width, tableConfig.headerHeight);
      doc.text('Precio Unit.', currentX + (tableConfig.columns[2].width / 2), currentY + 8, { align: 'center' });
      currentX += tableConfig.columns[2].width;
      
      // Columna Subtotal
      doc.rect(currentX, currentY, tableConfig.columns[3].width, tableConfig.headerHeight);
      doc.text('Subtotal', currentX + (tableConfig.columns[3].width / 2), currentY + 8, { align: 'center' });
      
      currentY += tableConfig.headerHeight;

      // Filas de datos
      doc.setTextColor(33, 37, 41);
      doc.setFont("helvetica", "normal");
      doc.setFontSize(9);
      doc.setDrawColor(200, 200, 200); // Gris claro para los bordes
      doc.setLineWidth(0.1);
      
      detallesDeVenta.forEach((detalle, index) => {
        // Alternar color de fondo
        if (index % 2 === 0) {
          doc.setFillColor(248, 249, 250);
          doc.rect(tableConfig.startX, currentY, usableWidth, tableConfig.cellHeight, 'F');
        }
        
        const nombreProducto = productos[detalle.id_producto]?.nombre_producto || 'Producto Desconocido';
        const nombreTruncado = truncateText(nombreProducto, 35);
        const cantidad = detalle.cantidad.toString();
        const precioUnitario = `$${Number(detalle.precio_unitario).toLocaleString('es-ES')}`;
        const subtotal = `$${(detalle.cantidad * detalle.precio_unitario).toLocaleString('es-ES')}`;
        
        currentX = tableConfig.startX;
        
        // Producto
        doc.rect(currentX, currentY, tableConfig.columns[0].width, tableConfig.cellHeight);
        doc.text(nombreTruncado, currentX + 3, currentY + (tableConfig.cellHeight / 2) + 1.5);
        currentX += tableConfig.columns[0].width;
        
        // Cantidad
        doc.rect(currentX, currentY, tableConfig.columns[1].width, tableConfig.cellHeight);
        const cantidadX = currentX + (tableConfig.columns[1].width / 2);
        const cantidadY = currentY + (tableConfig.cellHeight / 2) + 1.5;
        doc.text(cantidad, cantidadX, cantidadY, { align: 'center' });
        currentX += tableConfig.columns[1].width;
        
        // Precio Unitario
        doc.rect(currentX, currentY, tableConfig.columns[2].width, tableConfig.cellHeight);
        const precioX = currentX + tableConfig.columns[2].width - 3;
        const precioY = currentY + (tableConfig.cellHeight / 2) + 1.5;
        doc.text(precioUnitario, precioX, precioY, { align: 'right' });
        currentX += tableConfig.columns[2].width;
        
        // Subtotal
        doc.rect(currentX, currentY, tableConfig.columns[3].width, tableConfig.cellHeight);
        const subtotalX = currentX + tableConfig.columns[3].width - 3;
        const subtotalY = currentY + (tableConfig.cellHeight / 2) + 1.5;
        doc.text(subtotal, subtotalX, subtotalY, { align: 'right' });
        
        currentY += tableConfig.cellHeight;
      });
    }

    // === TOTALES DE LA VENTA ===
    currentY += 10;
    
    // Fondo para totales
    doc.setFillColor(233, 236, 239);
    doc.rect(pageWidth - margin - 80, currentY, 80, 20, 'F');
    
    doc.setFont("helvetica", "bold");
    doc.setFontSize(10);
    doc.setTextColor(33, 37, 41);
    
    const montoExtra = venta.monto_extra || 0;
    const totalVenta = Number(venta.total);
    
    if (montoExtra > 0) {
      doc.text(`Monto Extra: $${montoExtra.toLocaleString('es-ES')}`, pageWidth - margin - 78, currentY + 7);
      totalMontoExtra += montoExtra;
    }
    
    doc.setFontSize(12);
    doc.text(`Total: $${totalVenta.toLocaleString('es-ES')}`, pageWidth - margin - 78, currentY + 15);
    
    totalGeneral += totalVenta;
    currentY += 35;
  }

  // === RESUMEN FINAL ===
  if (ventas.length > 1) {
    // Verificar espacio para el resumen
    if (currentY + 40 > pageHeight - margin) {
      doc.addPage();
      currentY = margin + 20;
    }

    // Línea separadora
    doc.setDrawColor(0, 123, 255);
    doc.setLineWidth(2);
    doc.line(margin, currentY, pageWidth - margin, currentY);
    currentY += 15;

    // Resumen final
    doc.setFillColor(0, 123, 255);
    doc.rect(margin, currentY, usableWidth, 25, 'F');
    
    doc.setTextColor(255, 255, 255);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(16);
    doc.text('RESUMEN GENERAL', pageWidth / 2, currentY + 8, { align: 'center' });
    doc.text(`TOTAL: $${totalGeneral.toLocaleString('es-ES')}`, pageWidth / 2, currentY + 18, { align: 'center' });
  }

  // === PIE DE PÁGINA ===
  const addFooter = () => {
    doc.setTextColor(108, 117, 125);
    doc.setFont("helvetica", "normal");
    doc.setFontSize(8);
    doc.text('Sistema de Ventas - Generado automáticamente', pageWidth / 2, pageHeight - 10, { align: 'center' });
  };

  // Agregar pie de página a todas las páginas
  const totalPages = doc.getNumberOfPages();
  for (let i = 1; i <= totalPages; i++) {
    doc.setPage(i);
    addFooter();
    // Número de página
    doc.text(`Página ${i} de ${totalPages}`, pageWidth - margin, pageHeight - 10, { align: 'right' });
  }

  // === GUARDAR ARCHIVO ===
  const formattedDate = new Date().toLocaleDateString('es-ES', { 
    day: '2-digit', 
    month: '2-digit', 
    year: 'numeric' 
  }).replace(/\//g, '-') + '_' + new Date().toLocaleTimeString('es-ES', { 
    hour: '2-digit', 
    minute: '2-digit' 
  }).replace(/:/g, '-');
  
  doc.save(`reporte_ventas_${formattedDate}.pdf`);
};
