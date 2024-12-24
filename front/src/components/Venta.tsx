import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Producto } from '../interface/producto';
import { DetalleVenta } from '../interface/detalleVenta';
import { Venta } from '../interface/venta';
import '../styles/VentaStyle.css';

const Venta: React.FC = () => {
  const [detalles, setDetalles] = useState<DetalleVenta[]>([]);
  const [total, setTotal] = useState<number>(0);
  const [codigoBarras, setCodigoBarras] = useState<string>('');
  const [nombresProductos, setNombresProductos] = useState<
    Record<number, string>
  >({});
  const [venta, setVenta] = useState<Venta>({
    id_venta: 0,
    id_usuario: 1,
    fecha_venta: new Date().toISOString(),
    total: 0,
  });

  useEffect(() => {
    const totalCalculado = detalles.reduce(
      (acc, detalle) => acc + detalle.precio_unitario * detalle.cantidad,
      0
    );
    setTotal(totalCalculado);
  }, [detalles]);

  const buscarProductoPorCodigo = async (codigo: string) => {
    try {
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
        alert('Este producto ya ha sido añadido a la venta.');
        return;
      }

      const nuevoDetalle: DetalleVenta = {
        id_producto: Number(producto.id_producto),
        id_venta: venta.id_venta,
        cantidad: 1,
        precio_unitario: producto.precio_venta,
      };

      setDetalles([...detalles, nuevoDetalle]);

      // Actualizar el nombre del producto en el estado
      setNombresProductos((prevState) => ({
        ...prevState,
        [producto.id_producto]: producto.nombre_producto,
      }));
    } catch (error) {
      console.error('Error al buscar el producto por código de barras', error);
      alert('Error al buscar el producto');
    }
  };

  const handleCodigoBarras = (e: React.ChangeEvent<HTMLInputElement>) => {
    const codigo = e.target.value.trim();
    if (codigo) {
      buscarProductoPorCodigo(codigo);
      setCodigoBarras('');
    }
  };

  const eliminarProducto = (idProducto: number) => {
    const nuevosDetalles = detalles.filter(
      (detalle) => detalle.id_producto !== idProducto
    );
    setDetalles(nuevosDetalles);

    setNombresProductos((prevState) => {
      const { [idProducto]: _, ...rest } = prevState;
      return rest;
    });
  };

  const guardarVenta = () => {
    if (total <= 0) {
      alert('El total de la venta no puede ser 0.');
      return;
    }

    const nuevaVenta: Venta = {
      id_venta: 0,
      id_usuario: 1,
      fecha_venta: new Date().toISOString(),
      total: total,
    };

    axios
      .post('/api/venta', nuevaVenta)
      .then((response) => {
        const ventaCreada = response.data;
        setVenta(ventaCreada);

        detalles.forEach((detalle) => {
          axios
            .get(`/api/producto/${detalle.id_producto}`)
            .then((response) => {
              const producto = response.data;
              const nuevoStock = producto.stock - detalle.cantidad;

              axios
                .put(`/api/producto/stock/${detalle.id_producto}/${nuevoStock}`)
                .then(() => {
                  console.log('Stock del producto actualizado correctamente.');
                })
                .catch((error) => {
                  console.error(
                    'Error al actualizar el stock del producto',
                    error
                  );
                  alert('Error al actualizar el stock del producto.');
                });
            })
            .catch((error) => {
              console.error('Error al obtener el producto', error);
              alert('Error al obtener el producto.');
            });
          axios
            .post('/api/detalle-venta', {
              ...detalle,
              id_venta: ventaCreada.id_venta,
            })
            .then(() => {
              console.log('Detalle de venta guardado correctamente.');
            })
            .catch((error) => {
              console.error('Error al guardar el detalle de la venta', error);
              alert('Error al guardar los detalles de la venta.');
            });
        });

        alert('Venta guardada exitosamente.');
        setDetalles([]);
      })
      .catch((error) => {
        console.error('Error al guardar la venta', error);
        alert('Error al guardar la venta.');
      });
  };

  return (
    <div className="container">
      <h1>Registro de Venta</h1>
      <div>
        <label>Código de Barras:</label>
        <input
          type="text"
          value={codigoBarras}
          onChange={(e) => setCodigoBarras(e.target.value)}
          onBlur={(e) => handleCodigoBarras(e)}
          placeholder="Escanee el código de barras"
        />
      </div>
      <h3>Detalles de la venta</h3>
      <table>
        <thead>
          <tr>
            <th>Producto</th>
            <th>Cantidad</th>
            <th>Precio Unitario</th>
            <th>Eliminar</th>
          </tr>
        </thead>
        <tbody>
          {detalles.map((detalle, index) => (
            <tr key={index}>
              <td>{nombresProductos[detalle.id_producto] || 'Cargando...'}</td>
              <td>
                <input
                  type="number"
                  value={detalle.cantidad}
                  min="1"
                  onChange={(e) => {
                    const nuevaCantidad = parseInt(e.target.value);
                    const nuevosDetalles = detalles.map((d) =>
                      d.id_producto === detalle.id_producto
                        ? { ...d, cantidad: nuevaCantidad }
                        : d
                    );
                    setDetalles(nuevosDetalles);
                  }}
                />
              </td>
              <td>{detalle.precio_unitario}</td>
              <td>
                <button onClick={() => eliminarProducto(detalle.id_producto)}>
                  Eliminar
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      <h2>Total: {total.toFixed(2)}</h2>
      <button onClick={guardarVenta}>Guardar Venta</button>
    </div>
  );
};

export default Venta;
