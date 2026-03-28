import api from '../../shared/api/api';
import { DetalleVenta } from './detalleVenta.interface';
import { Venta } from './venta.interface';

export const guardarVenta = async (
  detalles: DetalleVenta[],
  total: number,
) => {
  const montoExtraCalculado = detalles
    .filter((detalle) => detalle.id_producto === 0)
    .reduce((acc, detalle) => acc + detalle.precio_unitario * detalle.cantidad, 0);

  const nuevaVenta: Venta = {
    id_venta: 0,
    id_usuario: null,
    fecha_venta: new Date().toISOString(),
    total: parseFloat(total.toFixed(0)),
    monto_extra: montoExtraCalculado,
  };


  try {
    const res_venta = await api.post('/venta', nuevaVenta);
    if (res_venta.status === 200) {
      try {
        const res_detalles = await api.post('/detalle-venta', {
          detalles: detalles,
          id_venta: res_venta.data.id_venta,
        });
        if (res_detalles.status === 200) {
          console.log(res_detalles);
          alert('Venta guardada exitosamente.');
          await api.post('/impresora/imprimir-ticket', {
            id_venta: res_venta.data.id_venta,
            total: total,
            fecha: new Date().toLocaleString('es-ES', { hour12: false })
          });
        }
      } catch (error) {
        console.error('Error al guardar los detalles de la venta:', error);
        alert('Error al guardar los detalles de la venta.');
      }
    }
  } catch (error) {
    console.error('Error al guardar la venta:', error);
    alert('Error al guardar la venta.');
  }
}