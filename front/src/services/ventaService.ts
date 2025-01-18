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
        await axios.post('/api/detalle-venta', {
          ...detalle,
          id_venta: ventaCreada.id_venta,
        });
        console.log('Detalle guardado:', detalle);
      } catch (error) {
        console.error('Error al guardar detalle:', detalle, error);
      }
    }

    alert('Venta guardada exitosamente.');
    const detallesParaTicket = detalles.filter((detalle) => detalle.id_producto === 0);
    const contenidoTicket = await generarContenidoTicket(ventaCreada, detallesAgrupados.concat(detallesParaTicket));
    await imprimirTicketBackend(contenidoTicket);

    setDetalles([]);
    setMontoExtra(0);

  } catch (error) {
    console.error('Error al guardar la venta:', error);
    alert('Error al guardar la venta.');
  }
};


const generarContenidoTicket = async (venta: Venta, detalles: DetalleVenta[]) => {
  let contenido = `CARNES PAMPA\nGracias por su compra\n`;
  contenido += "--------------------------------";

  for (const detalle of detalles) {
    const producto = await obtenerProductoPorId(detalle.id_producto);
    contenido += `\n${producto.nombre_producto}\n ${detalle.cantidad} x $${detalle.precio_unitario} = $${(detalle.precio_unitario * detalle.cantidad).toFixed(0)}\n`;
  }

  contenido += "--------------------------------\n";
  contenido += `Total: $${parseFloat(venta.total.toString()).toFixed(0)}\n`;
  contenido += `Fecha: ${new Date().toLocaleString()}\n`;
  contenido += "--------------------------------\n";

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

const imprimirTicketBackend = async (contenidoTicket: string) => {
  try {
    await axios.post('/api/impresora/imprimir', { contenido: contenidoTicket });
    console.log("Ticket enviado para impresión.");
  } catch (error) {
    console.error("Error al enviar el ticket para impresión:", error);
    alert("Error al enviar el ticket para impresión.");
  }
};
