import api from '../../shared/api/api';
import { DetalleVenta } from './detalleVenta.interface';
import { Venta } from './venta.interface';
import toast from 'react-hot-toast';

export const guardarVenta = async (
  detalles: DetalleVenta[],
  total: number,
) => {
  const nuevaVenta: Venta = {
    id_venta: 0,
    id_usuario: null,
    fecha_venta: new Date().toISOString(),
    total: parseFloat(total.toFixed(0))
  };


  try {
    console.log(nuevaVenta);
    console.log(detalles);
    const res_venta = await api.post('/venta', nuevaVenta);
    if (res_venta.status === 200) {
      const productosNormales = detalles.filter((d) => d.id_producto !== 0);
      if (productosNormales.length > 0) {
        const res_detalles = await api.post('/detalle-venta', {
          detalles: productosNormales,
          id_venta: res_venta.data.id_venta,
        });

        if (res_detalles.status !== 200) {
          console.error('Error al guardar detalles:', res_detalles);
          toast.error('Venta guardada pero hubo un error con los detalles.');
          return;
        }
      }
      const genericos = detalles.filter((d) => d.id_producto === 0);

      if (genericos.length > 0) {
        try {
          await api.post('/detalle-venta-generico', {
            genericos: genericos,
            id_venta: res_venta.data.id_venta
          });
        } catch (e) {
          console.error('Error guardando genéricos', e);
        }
      }

      console.log('Venta guardada exitosamente.');
      toast.success('Venta guardada exitosamente.');
      await api.post('/impresora/imprimir-ticket', {
        id_venta: res_venta.data.id_venta,
        total: total,
        fecha: new Date(res_venta.data.fecha_venta).toLocaleString('es-ES', { hour12: false }),
        genericos: genericos
      });
    }
  } catch (error) {
    console.error('Error al guardar la venta:', error);
    toast.error('Error al guardar la venta.');
  }
}