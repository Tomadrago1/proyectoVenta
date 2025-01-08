import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Producto } from '../interface/producto';
import { DetalleVenta } from '../interface/detalleVenta';
import { Venta } from '../interface/venta';
import '../styles/VentaStyle.css';

const Venta: React.FC = () => {
  const [detalles, setDetalles] = useState<DetalleVenta[]>([]);
  const [total, setTotal] = useState<number>(0);
  const [monto_extra, setMontoExtra] = useState<number>(0);
  const [codigoBarras, setCodigoBarras] = useState<string>('');
  const [nombresProductos, setNombresProductos] = useState<
    Record<number, string>
  >({});
  const [venta, setVenta] = useState<Venta>({
    id_venta: 0,
    id_usuario: 1,
    fecha_venta: new Date().toISOString(),
    total: 0,
    monto_extra: 0,
  });
  const [showModal, setShowModal] = useState<boolean>(false);
  const [nuevoMontoExtra, setNuevoMontoExtra] = useState<number>(0);

  useEffect(() => {
    const totalCalculado = detalles.reduce(
      (acc, detalle) => acc + detalle.precio_unitario * detalle.cantidad,
      0
    );
    setTotal(totalCalculado);
  }, [detalles]);

  const buscarProductoPorCodigo = async (codigo: string) => {
    try {
      const codigoRecortado = codigo.substring(1, 6);
      let importeStr = codigo.substring(6, 12);
      importeStr = importeStr.replace(/^0+/, '');
      console.log('Código recortado:', codigoRecortado);
      console.log('Importe:', importeStr);
      try {
        const responseRecortado = await axios.get(
          `/api/producto/barcode/${codigoRecortado}`
        );
        const productoRecortado: Producto = responseRecortado.data;

        if (productoRecortado) {
          const productoExistente = detalles.find(
            (d) => d.id_producto === Number(productoRecortado.id_producto)
          );
          if (productoExistente) {
            alert('Este producto ya ha sido añadido a la venta.');
            return;
          }
          const importe = parseFloat(importeStr);

          if (isNaN(importe) || importe <= 0) {
            alert('El importe en el código de barras no es válido.');
            return;
          }

          const cantidad = importe / productoRecortado.precio_venta;

          const nuevoDetalleRecortado: DetalleVenta = {
            id_producto: Number(productoRecortado.id_producto),
            id_venta: venta.id_venta,
            cantidad: parseFloat(cantidad.toString()),
            precio_unitario: productoRecortado.precio_venta,
          };

          setDetalles([...detalles, nuevoDetalleRecortado]);
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
      total: total + monto_extra,
      monto_extra: monto_extra,
    };

    axios
      .post('/api/venta', nuevaVenta)
      .then((response) => {
        const ventaCreada = response.data;
        setVenta(ventaCreada);
        console.log('Venta guardada correctamente.', ventaCreada);

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
        setMontoExtra(0);
      })
      .catch((error) => {
        console.error('Error al guardar la venta', error);
        alert('Error al guardar la venta.');
      });
  };

  const addExtraAmount = () => {
    setShowModal(true);
  };

  const handleMontoExtraSubmit = () => {
    if (nuevoMontoExtra > 0) {
      setMontoExtra((prevMontoExtra) => prevMontoExtra + nuevoMontoExtra);
      setNuevoMontoExtra(0);
      setShowModal(false);
    }
  };

  return (
    <div className="venta-container">
      <h1 className="venta-header">Registro de Venta</h1>
      <div className="venta-codigo">
        <label>Código de Barras:</label>
        <input
          type="text"
          value={codigoBarras}
          onChange={(e) => setCodigoBarras(e.target.value)}
          onBlur={(e) => handleCodigoBarras(e)}
          placeholder="Escanee el código de barras"
        />
      </div>
      <h3 className="venta-detalles-header">Detalles de la venta</h3>
      <table className="venta-tabla">
        <thead>
          <tr>
            <th>Producto</th>
            <th>Cantidad</th>
            <th>Precio Unitario</th>
            <th>Subtotal</th>
            <th></th>
          </tr>
        </thead>
        <tbody>
          {detalles.map((detalle, index) => (
            <tr key={index}>
              <td>{nombresProductos[detalle.id_producto] || 'Cargando...'}</td>
              <td>
                <input
                  type="text"
                  value={detalle.cantidad}
                  onChange={(e) => {
                    const nuevaCantidad = parseFloat(
                      e.target.value.replace(',', '.')
                    );
                    if (!isNaN(nuevaCantidad)) {
                      const nuevosDetalles = detalles.map((d) =>
                        d.id_producto === detalle.id_producto
                          ? { ...d, cantidad: nuevaCantidad }
                          : d
                      );
                      setDetalles(nuevosDetalles);
                    }
                  }}
                />
              </td>

              <td>{detalle.precio_unitario}</td>
              <td>{(detalle.cantidad * detalle.precio_unitario).toFixed(2)}</td>
              <td>
                <button onClick={() => eliminarProducto(detalle.id_producto)}>
                  Eliminar
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      <div className="venta-totales">
        <h2>Monto extra: {monto_extra.toFixed(2) || '0.00'}</h2>
        <h2>Total: {(total + monto_extra).toFixed(2)}</h2>
      </div>
      <div className="venta-botones">
        <button onClick={guardarVenta}>Guardar Venta</button>
        <button onClick={addExtraAmount}>Agregar monto extra</button>
      </div>
      {showModal && (
        <div className="modal">
          <div className="modal-content">
            <h3>Ingrese el monto extra</h3>
            <input
              type="number"
              value={nuevoMontoExtra}
              onChange={(e) => setNuevoMontoExtra(parseFloat(e.target.value))}
              min="0"
              placeholder="Monto extra"
            />
            <div className="modal-buttons">
              <button onClick={handleMontoExtraSubmit}>Aceptar</button>
              <button onClick={() => setShowModal(false)}>Cancelar</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Venta;
