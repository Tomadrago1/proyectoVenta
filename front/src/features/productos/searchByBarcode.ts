import api from '../../shared/api/api';
import { DetalleVenta } from '../venta/detalleVenta.interface';
import { Producto } from './producto.interface';
import { Venta } from '../venta/venta.interface';
import { BarcodeParseResult } from '../barcode/barcode.interface';
import toast from 'react-hot-toast';

/**
 * Busca un producto por código de barras usando el resultado del interceptor.
 *
 * Flujo:
 *  1. Recibe el resultado del interceptor (STANDARD_BARCODE o WEIGHTED_BARCODE)
 *  2. WEIGHTED_BARCODE → busca producto por PLU, usa el precio de la balanza
 *  3. STANDARD_BARCODE → busca producto por código completo (flujo normal)
 */
export const buscarProductoPorCodigo = async (
  codigo: string,
  venta: Venta,
  detalles: DetalleVenta[],
  setDetalles: React.Dispatch<React.SetStateAction<DetalleVenta[]>>,
  setNombresProductos: React.Dispatch<
    React.SetStateAction<{ [id_producto: number]: string }>
  >,
  parseResult?: BarcodeParseResult
) => {
  try {
    // ── Código de balanza (circulación restringida) ────────────────
    if (parseResult && parseResult.type === 'WEIGHTED_BARCODE') {
      const { plu, value, valueType } = parseResult;

      try {
        const response = await api.get(`/producto/barcode/${plu}`);
        const producto: Producto = response.data;

        if (producto) {
          // Si es peso (WEIGHT), el valor extraído es directamente la cantidad.
          // Ej. 1.250 (1250g con 3 decimales configurados) -> 1.250 kg.
          // Si es precio (PRICE), el valor extraído es el precio total,
          // calculamos la cantidad dividiendo por el precio unitario.
          const cantidad = valueType === 'WEIGHT'
            ? value
            : (producto.precio_venta > 0 ? value / producto.precio_venta : 1);

          const nuevoDetalle: DetalleVenta = {
            id_temp: Date.now(),
            id_producto: Number(producto.id_producto),
            id_venta: venta.id_venta,
            cantidad: parseFloat(cantidad.toFixed(3)),
            precio_unitario: producto.precio_venta,
          };

          setDetalles([...detalles, nuevoDetalle]);
          setNombresProductos((prev) => ({
            ...prev,
            [producto.id_producto]: producto.nombre_producto,
          }));
          return;
        }
      } catch {
        toast.error(`Producto con PLU "${plu}" no encontrado`);
        return;
      }
    }

    // ── Código estándar (búsqueda por código completo) ─────────────
    const response = await api.get(`/producto/barcode/${codigo}`);
    const producto: Producto = response.data;

    if (!producto) {
      toast.error('Producto no encontrado');
      return;
    }

    // Si el producto ya existe en la lista, incrementar cantidad
    const productoExistente = detalles.find(
      (d) => d.id_producto === Number(producto.id_producto)
    );
    if (productoExistente) {
      const nuevosDetalles = detalles.map((d) =>
        d.id_producto === Number(producto.id_producto)
          ? { ...d, cantidad: d.cantidad + 1 }
          : d
      );
      setDetalles(nuevosDetalles);
      return;
    }

    const nuevoDetalle: DetalleVenta = {
      id_temp: Date.now(),
      id_producto: Number(producto.id_producto),
      id_venta: venta.id_venta,
      cantidad: 1,
      precio_unitario: producto.precio_venta,
    };

    setDetalles([...detalles, nuevoDetalle]);
    setNombresProductos((prev) => ({
      ...prev,
      [producto.id_producto]: producto.nombre_producto,
    }));
  } catch (error) {
    if ((error as any).response && (error as any).response.status === 404) {
      toast.error('Producto no encontrado');
      return;
    }
    console.error('Error al buscar el producto por código de barras', error);
  }
};
