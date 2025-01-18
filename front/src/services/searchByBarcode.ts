import axios from 'axios';
import { DetalleVenta } from '../interface/detalleVenta';
import { Producto } from '../interface/producto';
import { Venta } from '../interface/venta';

export const buscarProductoPorCodigo = async (
  codigo: string,
  venta: Venta,
  detalles: DetalleVenta[],
  setDetalles: React.Dispatch<React.SetStateAction<DetalleVenta[]>>,
  setNombresProductos: React.Dispatch<
    React.SetStateAction<{ [id_producto: number]: string }>
  >
) => {
  try {
    const codigoUnitario = codigo.substring(2, 7);
    if (codigoUnitario === '99998') {
      const importe = parseFloat(codigo.substring(7, 12));
      const cantidad = parseFloat(codigo.substring(1, 2));
      if (isNaN(importe) || importe <= 0) {
        alert('El importe en el código de barras no es válido.');
        return;
      }

      const nuevoDetalle: DetalleVenta = {
        id_temp: Date.now(),
        id_producto: 0,
        id_venta: venta.id_venta,
        cantidad,
        precio_unitario: importe,
      };

      setDetalles([...detalles, nuevoDetalle]);
      return;
    }

    const codigoRecortado = codigo.substring(1, 6);
    let importeStr = codigo.substring(6, 12);
    importeStr = importeStr.replace(/^0+/, '');

    try {
      const responseRecortado = await axios.get(
        `/api/producto/barcode/${codigoRecortado}`
      );
      const productoRecortado: Producto = responseRecortado.data;

      if (productoRecortado) {
        const importe = parseFloat(importeStr);

        if (isNaN(importe) || importe <= 0) {
          alert('El importe en el código de barras no es válido.');
          return;
        }

        const cantidad = importe / productoRecortado.precio_venta;

        const nuevoDetalle: DetalleVenta = {
          id_temp: Date.now(),
          id_producto: Number(productoRecortado.id_producto),
          id_venta: venta.id_venta,
          cantidad: parseFloat(cantidad.toFixed(3)),
          precio_unitario: productoRecortado.precio_venta,
        };

        setDetalles([...detalles, nuevoDetalle]);
        setNombresProductos((prevState) => ({
          ...prevState,
          [productoRecortado.id_producto]: productoRecortado.nombre_producto,
        }));
        return;
      }
    } catch {
      console.log(
        'No se encontró el producto con el código recortado, intentando con el código completo...'
      );
    }

    const response = await axios.get(`/api/producto/barcode/${codigo}`);
    const producto: Producto = response.data;

    if (!producto) {
      alert('Producto no encontrado');
      return;
    }

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
    setNombresProductos((prevState) => ({
      ...prevState,
      [producto.id_producto]: producto.nombre_producto,
    }));
  } catch (error) {
    console.error('Error al buscar el producto por código de barras', error);
  }
};
