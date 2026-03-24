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
            const stockResponse = await axios.put(`/api/producto/decrement-stock/${detalle.id_producto}/${detalle.cantidad}`);
          } catch (stockError: any) {
            console.error(`Error al decrementar stock del producto ${detalle.id_producto}:`, stockError);
            console.error('Error details:', stockError.response?.data);
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
    const detallesConProductos = await prepararDetallesParaTicket(detallesAgrupados.concat(detallesParaTicket));
    await imprimirTicketBackend(detallesConProductos, total, new Date().toLocaleString('es-ES', { hour12: false }));

    setDetalles([]);
    setMontoExtra(0);

  } catch (error) {
    console.error('Error al guardar la venta:', error);
    alert('Error al guardar la venta.');
  }
};

const prepararDetallesParaTicket = async (detalles: DetalleVenta[]) => {
  // Obtener todos los productos en paralelo
  const productosPromises = detalles.map(detalle => 
    obtenerProductoPorId(detalle.id_producto)
  );
  const productos = await Promise.all(productosPromises);
  
  // Crear array de detalles con información completa del producto
  return detalles.map((detalle, index) => ({
    nombre_producto: productos[index].nombre_producto,
    cantidad: detalle.cantidad,
    precio_unitario: detalle.precio_unitario
  }));
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

const imprimirTicketBackend = async (detalles: any[], total: number, fecha: string) => {
  try {
    await axios.post('/api/impresora/imprimir', { detalles, fecha, total });
    console.log("Ticket enviado para impresión.");
  } catch (error) {
    console.error("Error al enviar el ticket para impresión:", error);
    alert("Error al enviar el ticket para impresión.");
  }
};
