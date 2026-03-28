import React, { useState, useEffect } from 'react';
import { DetalleVenta } from './detalleVenta.interface';
import { Venta } from './venta.interface';
import './Venta.css';
import { guardarVenta } from './ventaService';
import { buscarProductoPorCodigo } from '../productos/searchByBarcode';

const VentaPage: React.FC = () => {
  const [detalles, setDetalles] = useState<DetalleVenta[]>([]);
  const [total, setTotal] = useState<number>(0);
  const [monto_extra, setMontoExtra] = useState<number>(0);
  const [codigoBarras, setCodigoBarras] = useState<string>('');
  const [nombresProductos, setNombresProductos] = useState<
    Record<number, string>
  >({});
  const [venta, setVenta] = useState<Venta>({
    id_venta: 0,
    id_usuario: null,
    fecha_venta: new Date().toISOString(),
    total: 0
  });
  const [showModal, setShowModal] = useState<boolean>(false);
  const [nuevoMontoExtra, setNuevoMontoExtra] = useState<number>(0);

  useEffect(() => {
    const guardada = localStorage.getItem('ventaActual');
    if (guardada) {
      try {
        const parsed = JSON.parse(guardada);
        setDetalles(parsed.detalles || []);
        setTotal(parsed.total || 0);
        setVenta(
          parsed.venta || {
            id_venta: 0,
            fecha_venta: new Date().toISOString(),
            total: 0
          }
        );
        setNombresProductos(parsed.nombresProductos || {});
      } catch (err) {
        console.error('Error leyendo venta guardada:', err);
      }
    }
  }, []);

  useEffect(() => {
    const totalCalculado = detalles.reduce(
      (acc, detalle) => acc + detalle.precio_unitario * detalle.cantidad,
      0
    );
    setTotal(totalCalculado);
  }, [detalles]);

  useEffect(() => {
    const data = {
      detalles,
      total,
      venta,
      nombresProductos,
      fechaGuardado: Date.now(),
    };
    localStorage.setItem('ventaActual', JSON.stringify(data));
  }, [detalles, total, venta, nombresProductos]);

  const handleCodigoBarras = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      const codigo = (e.target as HTMLInputElement).value.trim();
      if (codigo) {
        buscarProductoPorCodigo(
          codigo,
          venta,
          detalles,
          setDetalles,
          setNombresProductos
        );
        setCodigoBarras('');
      }
    }
  };

  const eliminarProducto = (idTemp: number) => {
    const nuevosDetalles = detalles.filter(
      (detalle) => detalle.id_temp !== idTemp
    );
    setDetalles(nuevosDetalles);

    setNombresProductos((prevState) => {
      const { [idTemp]: _, ...rest } = prevState;
      return rest;
    });
  };

  const handleGuardarVenta = () => {
    try {
      if (total <= 0) {
        alert('El total de la venta debe ser mayor a 0');
        return;
      }
      console.log(detalles);
      guardarVenta(detalles, total);
      setVenta({
        id_venta: 0,
        id_usuario: null,
        fecha_venta: new Date().toISOString(),
        total: 0
      });
      setDetalles([]);
      setMontoExtra(0);
      setTotal(0);
      setNombresProductos({});
      localStorage.removeItem('ventaActual');
    } catch (error) {
      console.error('Error al guardar la venta:', error);
    }
  };

  const addExtraAmount = () => {
    setShowModal(true);
  };

  const handleMontoExtraSubmit = () => {
    if (nuevoMontoExtra > 0) {
      const nuevoDetalle: DetalleVenta = {
        id_temp: Date.now(),
        id_producto: 0,
        id_venta: venta.id_venta,
        cantidad: 1,
        precio_unitario: nuevoMontoExtra,
      };

      setDetalles((prevDetalles) => [...prevDetalles, nuevoDetalle]);
      setTotal(
        (prevTotal) => prevTotal + nuevoMontoExtra * nuevoDetalle.cantidad
      );

      setNuevoMontoExtra(0);
      setShowModal(false);
    }
  };

  const cancelarVenta = () => {
    if (window.confirm('¿Está seguro de que desea cancelar la venta?')) {
      setDetalles([]);
      setMontoExtra(0);
      localStorage.removeItem('ventaActual');
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
          onKeyDown={(e) => handleCodigoBarras(e)}
          autoFocus
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
          {detalles.map((detalle) => (
            <tr key={detalle.id_temp}>
              <td>
                {nombresProductos[detalle.id_producto] || 'Producto generico'}
              </td>
              <td>
                <input
                  type="number"
                  value={
                    Number.isInteger(detalle.cantidad)
                      ? detalle.cantidad
                      : detalle.cantidad.toFixed(3)
                  }
                  onChange={(e) => {
                    const nuevaCantidad = parseFloat(e.target.value);
                    if (!isNaN(nuevaCantidad)) {
                      const nuevosDetalles = detalles.map((d) =>
                        d.id_temp === detalle.id_temp
                          ? { ...d, cantidad: nuevaCantidad }
                          : d
                      );
                      setDetalles(nuevosDetalles);
                    }
                  }}
                  step={1}
                  min={0}
                />
              </td>
              <td>{detalle.precio_unitario}</td>
              <td>{(detalle.cantidad * detalle.precio_unitario).toFixed(0)}</td>
              <td>
                <button onClick={() => eliminarProducto(detalle.id_temp)}>
                  Eliminar
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      <div className="venta-totales">
        <h2>Total: {total.toFixed(0)}</h2>
      </div>
      <div className="venta-botones">
        <button onClick={handleGuardarVenta}>Guardar Venta</button>
        <button onClick={addExtraAmount}>Agregar producto generico</button>
        <button onClick={cancelarVenta}>Cancelar venta</button>
      </div>
      {showModal && (
        <div className="modal">
          <div className="modal-content">
            <h3>Precio del producto</h3>
            <input
              type="number"
              value={nuevoMontoExtra}
              onChange={(e) => setNuevoMontoExtra(parseFloat(e.target.value))}
              min="0"
              placeholder="Monto extra (precio unitario)"
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

export default VentaPage;
