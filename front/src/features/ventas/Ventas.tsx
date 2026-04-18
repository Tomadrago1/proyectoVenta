import React, { useState, useEffect, useRef } from 'react';
import api from '../../shared/api/api';
import { Venta } from '../venta/venta.interface';
import { DetalleVenta } from '../venta/detalleVenta.interface';
import { formatFechaHora } from '../../shared/utils/fechaConverter';
import './Ventas.css';
import { generateReport } from './generateReport';
import { useWebUSBPrinter } from '../printer/useWebUSBPrinter';
import { printerConfigService } from '../printer/printerConfigService';
import { encodeTicket } from '../printer/ticketEncoder';
import toast from 'react-hot-toast';

const Ventas: React.FC = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const detalleRef = useRef<HTMLDivElement>(null);

  const [ventas, setVentas] = useState<Venta[]>([]);
  const [detalleVenta, setDetalleVenta] = useState<DetalleVenta[] | null>(null);
  const [startDate, setStartDate] = useState<string>('');
  const [endDate, setEndDate] = useState<string>('');
  const [selectedVenta, setSelectedVenta] = useState<number | null>(null);

  // ── WebUSB Printer ──────────────────────────────────────────────
  const printer = useWebUSBPrinter();

  useEffect(() => {
    printer.reconnect();
  }, []);

  const [usuarios, setUsuarios] = useState<
    Record<number, { nombre: string; apellido: string }>
  >({});
  const [productos, setProductos] = useState<Record<number, string>>({});

  const [pagina, setPagina] = useState<number>(1);
  const [ventasPorPagina] = useState<number>(10);

  const fetchVentas = async () => {
    try {
      const response = await api.get('/venta');
      const ventasData = response.data;

      const usuariosIds = [
        ...new Set(ventasData.map((venta: Venta) => venta.id_usuario)),
      ];

      const usuariosResponse = await Promise.all(
        usuariosIds.map((id) => api.get(`/usuario/${id}`))
      );

      const usuariosMap = usuariosResponse.reduce(
        (acc, curr) => ({
          ...acc,
          [curr.data.id_usuario]: {
            nombre: curr.data.nombre,
            apellido: curr.data.apellido,
          },
        }),
        {}
      );

      setUsuarios(usuariosMap);
      setVentas(ventasData);
    } catch (error) {
      console.error('Error al cargar las ventas o los usuarios:', error);
    }
  };

  const fetchDetalleVenta = async (idVenta: number) => {
    try {
      const response = await api.get(`/detalle-venta/${idVenta}`);
      let detalleVentaData = response.data;

      try {
        const resGen = await api.get(`/detalle-venta-generico/${idVenta}`);
        if (resGen.data && resGen.data.length > 0) {
          const genericosAdaptados = resGen.data.map((g: any) => ({
            id_producto: `gen-${g.id_detalle_generico}`,
            cantidad: g.cantidad,
            precio_unitario: g.precio_unitario,
            is_generico: true,
            descripcion: g.descripcion
          }));
          detalleVentaData = [...detalleVentaData, ...genericosAdaptados];
        }
      } catch (err) {
        console.error('No se pudieron cargar los detalles genéricos', err);
      }

      const productosIds = [
        ...new Set(
          detalleVentaData.filter((d: any) => !d.is_generico).map((detalle: any) => detalle.id_producto)
        ),
      ];

      const productosResponse = await Promise.all(
        productosIds.map((id) => api.get(`/producto/${id}`))
      );

      const productosMap = productosResponse.reduce(
        (acc, curr) => ({
          ...acc,
          [curr.data.id_producto]: curr.data.nombre_producto,
        }),
        {}
      );

      setProductos(productosMap);
      setDetalleVenta(detalleVentaData);
    } catch (error) {
      console.error(
        'Error al cargar el detalle de la venta o los productos:',
        error
      );
    }
  };

  useEffect(() => {
    fetchVentas();
  }, []);

  const handleFilter = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      if (!startDate && !endDate) {
        const response = await api.get(`/venta`);
        setSelectedVenta(null);
        setPagina(1);
        setVentas(response.data);
        return;
      }

      if (!startDate || !endDate) {
        alert('Por favor, selecciona un rango de fechas completo');
        return;
      }

      const response = await api.get(`/venta/filtro/fechas`, {
        params: { startDate, endDate },
      });
      setSelectedVenta(null);
      setPagina(1);
      setVentas(response.data);
    } catch (error) {
      console.error('Error al filtrar las ventas:', error);
    }
  };

  const handleSelectVenta = async (idVenta: number) => {
    setSelectedVenta(idVenta);
    await fetchDetalleVenta(idVenta);
    setTimeout(() => {
      detalleRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 100);
  };

  const handleCloseDetalle = () => {
    containerRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    setTimeout(() => {
      setSelectedVenta(null);
      setDetalleVenta(null);
    }, 300);
  };

  const handleFilterToday = async () => {
    const today = new Date().toISOString().split('T')[0];
    setStartDate(today);
    setEndDate(today);
    try {
      const response = await api.get(`/venta/filtro/fechas`, {
        params: { startDate: today, endDate: today },
      });
      setSelectedVenta(null);
      setPagina(1);
      setVentas(response.data);
    } catch (error) {
      console.error('Error al filtrar las ventas de hoy:', error);
    }
  };

  const handleFilterThisMonth = async () => {
    const today = new Date();
    const firstDay = new Date(today.getFullYear(), today.getMonth(), 1)
      .toISOString().split('T')[0];
    const lastDay = today.toISOString().split('T')[0];
    setStartDate(firstDay);
    setEndDate(lastDay);
    try {
      const response = await api.get(`/venta/filtro/fechas`, {
        params: { startDate: firstDay, endDate: lastDay },
      });
      setSelectedVenta(null);
      setPagina(1);
      setVentas(response.data);
    } catch (error) {
      console.error('Error al filtrar las ventas del mes:', error);
    }
  };

  const handleReimprimirTicket = async () => {
    if (!selectedVenta || !detalleVenta) return;

    const ventaActual = ventas.find((v) => v.id_venta === selectedVenta);
    if (!ventaActual) return;

    if (printer.status !== 'connected') {
      toast.error('Impresora no conectada. Configurala desde el panel de administración.');
      return;
    }

    try {
      const ticketData = await printerConfigService.getTicketData(selectedVenta);

      // Agregar genéricos del detalle actual
      const genericos = detalleVenta
        .filter((d: any) => d.is_generico)
        .map((d: any) => ({
          cantidad: d.cantidad,
          precio_unitario: Number(d.precio_unitario),
          nombre_producto: d.descripcion || 'Producto Genérico',
        }));

      const allDetalles = [...ticketData.detalles, ...genericos];
      const cols = ticketData.printerConfig?.columns_count ?? 48;
      const fecha = new Date(ventaActual.fecha_venta).toLocaleString('es-ES', { hour12: false });
      const bytes = encodeTicket(allDetalles, ticketData.negocio, fecha, Number(ventaActual.total), cols);
      const success = await printer.print(bytes);

      if (success) {
        toast.success('Ticket enviado a la impresora correctamente.');
      } else {
        toast.error('Error al enviar el ticket a la impresora.');
      }
    } catch (error) {
      console.error('Error al reimprimir el ticket:', error);
      toast.error('Hubo un error al intentar reimprimir el ticket.');
    }
  };

  const handleGenerarReporte = () => {
    generateReport(ventas);
  };

  const indiceInicial = (pagina - 1) * ventasPorPagina;
  const ventasPaginadas = ventas.slice(
    indiceInicial,
    indiceInicial + ventasPorPagina
  );

  const totalPaginas = Math.ceil(ventas.length / ventasPorPagina);

  const cambiarPagina = (numero: number) => {
    if (numero >= 1 && numero <= Math.ceil(ventas.length / ventasPorPagina)) {
      setPagina(numero);
    }
  };

  return (
    <div className="ventas-container" ref={containerRef}>
      <div className="ventas-header-container">
        <h1 className="ventas-header">Historial de Ventas</h1>

        <form className="ventas-form" onSubmit={handleFilter}>
          <label>
            Desde:
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
            />
          </label>
          <label>
            Hasta:
            <input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
            />
          </label>
          <button type="submit" className="btn-filtro">
            Filtrar
          </button>
        </form>
        <div className="ventas-btn-group">
          <button onClick={handleFilterToday} className="btn-filtro-hoy">
            Ventas del Día
          </button>
          <button onClick={handleFilterThisMonth} className="btn-filtro-mes">
            Ventas del Mes
          </button>
          <button onClick={handleGenerarReporte} className="btn-filtro-reporte">
            Generar Reporte (Filtro Actual)
          </button>
        </div>
      </div>

      <table className="ventas-tabla">
        <thead>
          <tr>
            <th>ID Venta</th>
            <th>Usuario</th>
            <th>Fecha</th>
            <th>Total</th>
            <th>Detalles</th>
          </tr>
        </thead>
        <tbody>
          {ventasPaginadas.map((venta) => (
            <tr key={venta.id_venta}>
              <td>{venta.id_venta}</td>
              <td>
                {`${usuarios[venta.id_usuario!]?.nombre || ''} ${usuarios[venta.id_usuario!]?.apellido || ''
                  }`}
              </td>
              <td>{formatFechaHora(venta.fecha_venta)}</td>
              <td>${Number(venta.total).toFixed(0)}</td>
              <td>
                <button
                  onClick={() =>
                    venta.id_venta !== null && handleSelectVenta(venta.id_venta)
                  }
                >
                  Ver Detalle
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      <div className="pagination">
        <button
          onClick={() => cambiarPagina(pagina - 1)}
          disabled={pagina === 1}
        >
          Anterior
        </button>
        <span>
          Página {pagina} / {totalPaginas}
        </span>
        <button
          onClick={() => cambiarPagina(pagina + 1)}
          disabled={pagina === totalPaginas}
        >
          Siguiente
        </button>
      </div>

      {detalleVenta && selectedVenta && (
        <div className="ventas-detalle" ref={detalleRef}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px', borderBottom: '2px solid var(--pos-bg-surface)', paddingBottom: '16px' }}>
            <h2 style={{ margin: 0, border: 'none', padding: 0 }}>Detalle de la Venta {selectedVenta}</h2>
            <button
              onClick={handleCloseDetalle}
              style={{
                background: 'transparent',
                border: 'none',
                fontSize: '28px',
                cursor: 'pointer',
                color: 'var(--pos-text-secondary)',
                padding: '0 8px',
                lineHeight: '1',
                fontWeight: 'bold',
                transition: 'color 0.2s'
              }}
              onMouseEnter={(e) => (e.currentTarget.style.color = 'var(--pos-danger-color)')}
              onMouseLeave={(e) => (e.currentTarget.style.color = 'var(--pos-text-secondary)')}
              title="Cerrar detalle"
            >
              ×
            </button>
          </div>
          <div className="ventas-detalle-info">
            <p>
              <strong>Vendedor:</strong>{' '}
              {`${usuarios[
                ventas.find((venta) => venta.id_venta === selectedVenta)
                  ?.id_usuario || 0
              ]?.nombre || ''
                } ${usuarios[
                  ventas.find((venta) => venta.id_venta === selectedVenta)
                    ?.id_usuario ?? 0
                ]?.apellido || ''
                }`}
            </p>
            <p>
              <strong>Fecha:</strong>{' '}
              {formatFechaHora(
                ventas.find((venta) => venta.id_venta === selectedVenta)
                  ?.fecha_venta || ''
              )}
            </p>
          </div>

          <table className="ventas-detalle-tabla">
            <thead>
              <tr>
                <th>Producto</th>
                <th>Cantidad</th>
                <th>Precio Unitario</th>
                <th>Subtotal</th>
              </tr>
            </thead>
            <tbody>
              {detalleVenta.map((detalle: any) => (
                <tr key={detalle.id_producto}>
                  <td>{detalle.is_generico ? detalle.descripcion : productos[detalle.id_producto]}</td>
                  <td>{detalle.cantidad}</td>
                  <td>${Number(detalle.precio_unitario).toFixed(0)}</td>
                  <td>
                    ${(detalle.cantidad * detalle.precio_unitario).toFixed(0)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          <h2>
            <span>
              Monto Total: $
              {ventas.find((v) => v.id_venta === selectedVenta)?.total}
            </span>
          </h2>

          <div style={{ marginTop: '20px', textAlign: 'right' }}>
            <button
              onClick={handleReimprimirTicket}
              style={{
                backgroundColor: '#10b981', // Verde suave para imprimir
                color: 'white',
                padding: '10px 20px',
                border: 'none',
                borderRadius: '5px',
                cursor: 'pointer',
                fontWeight: 'bold',
                boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
              }}
            >
              Reimprimir Ticket
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Ventas;