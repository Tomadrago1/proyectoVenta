import React, { useState, useEffect } from 'react';
import { DetalleVenta } from './detalleVenta.interface';
import { Venta } from './venta.interface';
import './Venta.css';
import { guardarVenta } from './ventaService';
import { buscarProductoPorCodigo } from '../productos/searchByBarcode';
import { useBarcodeConfigs } from '../barcode/useBarcodeConfigs';
import { useBarcodeInterceptor } from '../barcode/useBarcodeInterceptor';
import { useWebUSBPrinter } from '../printer/useWebUSBPrinter';
import { printerConfigService } from '../printer/printerConfigService';
import { encodeTicket } from '../printer/ticketEncoder';
import toast from 'react-hot-toast';

const VentaPage: React.FC = () => {
  const [detalles, setDetalles] = useState<DetalleVenta[]>([]);
  const [total, setTotal] = useState<number>(0);
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
  const [showConfirm, setShowConfirm] = useState<boolean>(false);
  const [nuevoMontoExtra, setNuevoMontoExtra] = useState<number>(0);

  // ── Barcode interceptor (carga configs una vez, parsea local) ────
  const { configs: barcodeConfigs } = useBarcodeConfigs();
  const { interceptBarcode } = useBarcodeInterceptor(barcodeConfigs);

  // ── WebUSB Printer ──────────────────────────────────────────────
  const printer = useWebUSBPrinter();

  // Auto-reconectar impresora al montar
  useEffect(() => {
    printer.reconnect();
  }, []);

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
        const parseResult = interceptBarcode(codigo);
        buscarProductoPorCodigo(
          codigo,
          venta,
          detalles,
          setDetalles,
          setNombresProductos,
          parseResult
        );
        setCodigoBarras('');
      }
    } else if (e.key === 'ArrowDown') {
      e.preventDefault();
      const firstInput = document.querySelector('.venta-tabla tbody tr:first-child input[type="number"]') as HTMLInputElement;
      if (firstInput) firstInput.focus();
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      const lastInput = document.querySelector('.venta-tabla tbody tr:last-child input[type="number"]') as HTMLInputElement;
      if (lastInput) lastInput.focus();
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

  const handleGuardarVenta = async () => {
    try {
      if (total <= 0) {
        toast.error('El total de la venta debe ser mayor a 0');
        return;
      }
      console.log(detalles);
      const ventaResult = await guardarVenta(detalles, total);
      setVenta({
        id_venta: 0,
        id_usuario: null,
        fecha_venta: new Date().toISOString(),
        total: 0
      });
      setDetalles([]);
      setTotal(0);
      setNombresProductos({});
      localStorage.removeItem('ventaActual');

      // Imprimir ticket localmente vía WebUSB
      if (ventaResult && printer.status === 'connected') {
        try {
          const ticketData = await printerConfigService.getTicketData(ventaResult.id_venta);
          const addedGenericos = (ventaResult.genericos || []).map((gen: any) => ({
            cantidad: gen.cantidad,
            precio_unitario: Number(gen.precio_unitario),
            nombre_producto: 'Producto Genérico',
          }));
          const allDetalles = [...ticketData.detalles, ...addedGenericos];
          const cols = ticketData.printerConfig?.columns_count ?? 48;
          const fecha = new Date(ventaResult.fecha_venta).toLocaleString('es-ES', { hour12: false });
          const bytes = encodeTicket(allDetalles, ticketData.negocio, fecha, ventaResult.total, cols);
          await printer.print(bytes);
        } catch (printErr) {
          console.error('Error al imprimir ticket:', printErr);
          toast.error('Venta guardada, pero hubo un error al imprimir el ticket.');
        }
      }
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
    setDetalles([]);
    localStorage.removeItem('ventaActual');
    setShowConfirm(false);
    toast.success('Venta cancelada correctamente');
  };

  useEffect(() => {
    const handleGlobalKeyDown = (e: KeyboardEvent) => {
      if (showModal || showConfirm) {
        if (e.key === 'Escape') {
          e.preventDefault();
          setShowModal(false);
          setShowConfirm(false);
        }
        return;
      }

      if (e.key === 'F12') {
        e.preventDefault();
        handleGuardarVenta();
      } else if (e.key === 'F4' || e.key === 'Escape') {
        e.preventDefault();
        if (detalles.length > 0) {
          setShowConfirm(true);
        }
      } else if (e.key === 'F2') {
        e.preventDefault();
        addExtraAmount();
      }
    };

    window.addEventListener('keydown', handleGlobalKeyDown);
    return () => window.removeEventListener('keydown', handleGlobalKeyDown);
  }, [detalles, total, venta, showModal, handleGuardarVenta, cancelarVenta, addExtraAmount]);

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
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      const mainInput = document.querySelector('.venta-codigo input[type="text"]') as HTMLInputElement;
                      if (mainInput) mainInput.focus();
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
        <button className="btn-success" onClick={handleGuardarVenta}>
          Finalizar y Cobrar <b>[F12]</b>
        </button>
        <button className="btn-secondary" onClick={addExtraAmount}>
          Producto genérico <b>[F2]</b>
        </button>
        <button className="btn-danger" onClick={() => setShowConfirm(true)}>
          Cancelar venta <b>[Esc]</b>
        </button>
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
              autoFocus
              onKeyDown={(e) => {
                if (e.key === 'Enter') handleMontoExtraSubmit();
              }}
            />
            <div className="modal-buttons">
              <button onClick={handleMontoExtraSubmit}>Aceptar</button>
              <button onClick={() => setShowModal(false)}>Cancelar</button>
            </div>
          </div>
        </div>
      )}
      {showConfirm && (
        <div className="modal">
          <div className="modal-content">
            <h3>¿Cancelar Venta?</h3>
            <p>Se borrarán todos los productos de la lista actual.</p>
            <div className="modal-buttons">
              <button className="btn-danger" onClick={cancelarVenta}>Confirmar Cancelación</button>
              <button className="btn-secondary" onClick={() => setShowConfirm(false)}>Seguir Vendiendo</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default VentaPage;