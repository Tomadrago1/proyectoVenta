import axios from 'axios';
import { DetalleVenta } from '../interface/detalleVenta';
import { Venta } from '../interface/venta';
import { Producto } from '../interface/producto';

export const guardarVenta = async (
  detalles: DetalleVenta[],
  total: number,
  setVenta: (venta: Venta) => void,
  setDetalles: (detalles: DetalleVenta[]) => void,
  setMontoExtra: (monto: number) => void
) => {
  if (total <= 0) {
    alert('El total de la venta no puede ser 0.');
    return;
  }

  const montoExtraCalculado = detalles
    .filter((detalle) => detalle.id_producto === 0)
    .reduce((acc, detalle) => acc + detalle.precio_unitario * detalle.cantidad, 0);

  const nuevaVenta: Venta = {
    id_venta: 0,
    id_usuario: 1,
    fecha_venta: new Date().toISOString(),
    total: parseFloat(total.toFixed(0)),
    monto_extra: montoExtraCalculado,
  };

  const detallesAgrupados: DetalleVenta[] = [];
  const mapDetalles = new Map<number, DetalleVenta>();

  detalles.forEach((detalle) => {
    if (detalle.id_producto !== 0) {
      if (mapDetalles.has(detalle.id_producto)) {
        const detalleExistente = mapDetalles.get(detalle.id_producto)!;
        detalleExistente.cantidad += detalle.cantidad;
      } else {
        mapDetalles.set(detalle.id_producto, { ...detalle });
      }
    }
  });

  mapDetalles.forEach((detalle) => detallesAgrupados.push(detalle));

  try {
    const response = await axios.post('/api/venta', nuevaVenta);
    const ventaCreada = response.data;
    setVenta(ventaCreada);

    for (const detalle of detallesAgrupados) {
      try {
        // Guardar el detalle de venta
        await axios.post('/api/detalle-venta', {
          ...detalle,
          id_venta: ventaCreada.id_venta,
        });
        console.log('Detalle guardado:', detalle);

        // Decrementar el stock del producto (solo si no es producto genérico)
        if (detalle.id_producto !== 0) {
          try {
            console.log(`Intentando decrementar stock para producto ID: ${detalle.id_producto}, cantidad: ${detalle.cantidad}`);
            const stockResponse = await axios.put(`/api/producto/decrement-stock/${detalle.id_producto}/${detalle.cantidad}`);
            console.log(`Stock decrementado exitosamente para producto ${detalle.id_producto}:`, stockResponse.data);
          } catch (stockError: any) {
            console.error(`Error al decrementar stock del producto ${detalle.id_producto}:`, stockError);
            console.error('Error details:', stockError.response?.data);
            // Notificar el error pero no interrumpir el proceso de venta
            const errorMsg = stockError.response?.data?.errorMessage || stockError.message || 'Error desconocido';
            alert(`Advertencia: No se pudo actualizar el stock del producto ${detalle.id_producto}. Error: ${errorMsg}`);
          }
        }
      } catch (error) {
        console.error('Error al guardar detalle:', detalle, error);
      }
    }

    alert('Venta guardada exitosamente.');
    const detallesParaTicket = detalles.filter((detalle) => detalle.id_producto === 0);
    const contenidoTicket = await generarContenidoTicket(detallesAgrupados.concat(detallesParaTicket));
    await imprimirTicketBackend(contenidoTicket, total, new Date().toLocaleString('es-ES', { hour12: false }));

    setDetalles([]);
    setMontoExtra(0);

  } catch (error) {
    console.error('Error al guardar la venta:', error);
    alert('Error al guardar la venta.');
  }
};

const generarContenidoTicket = async (detalles: DetalleVenta[]) => {
  let contenido = "";

  for (const detalle of detalles) {
    const producto = await obtenerProductoPorId(detalle.id_producto);

    const cantidad = Number(detalle.cantidad) || 0;
    const precioUnitario = Number(detalle.precio_unitario) || 0;

    const subtotal = cantidad * precioUnitario;

    contenido += `\x1b\x45\x01${producto.nombre_producto}\x1b\x45\x00\n`;

    const lineaDetalle = `${cantidad} x $${precioUnitario.toFixed(0)}`;
    const subtotalString = `$${subtotal.toFixed(0)}`;
    const espacioParaSubtotal = 32 - lineaDetalle.length - subtotalString.length;
    const lineaConSubtotal = lineaDetalle + " ".repeat(Math.max(0, espacioParaSubtotal)) + subtotalString;

    contenido += `${lineaConSubtotal}\n`;
  }
  contenido = contenido.replace(/\n$/, '');
  return contenido;
};



const obtenerProductoPorId = async (id_producto: number): Promise<Producto> => {
  try {
    const response = await axios.get(`/api/producto/${id_producto}`);
    return response.data;
  } catch (error) {
    console.error("Error al obtener el producto:", error);
    return {
      id_producto: id_producto.toString(),
      nombre_producto: "Producto Generico",
      id_categoria: "0",
      precio_compra: 0,
      precio_venta: 0,
      stock: 0,
      codigo_barras: ""
    };
  }
};

const imprimirTicketBackend = async (contenidoTicket: string, total: number, fecha: string) => {
  try {
    await axios.post('/api/impresora/imprimir', { contenido: contenidoTicket, fecha, total });
    console.log("Ticket enviado para impresión.");
  } catch (error) {
    console.error("Error al enviar el ticket para impresión:", error);
    alert("Error al enviar el ticket para impresión.");
  }
};
