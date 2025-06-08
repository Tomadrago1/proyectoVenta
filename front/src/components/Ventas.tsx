import React, { useState, useEffect } from 'react';
import axios from 'axios';
import jsPDF from 'jspdf';
import { Venta } from '../interface/venta';
import { DetalleVenta } from '../interface/detalleVenta';
import { formatFechaHora } from '../utils/fechaConverter';
import '../styles/VentasStyle.css';
import { generateReport } from '../services/generateReport';

const Ventas: React.FC = () => {
  const [ventas, setVentas] = useState<Venta[]>([]);
  const [detalleVenta, setDetalleVenta] = useState<DetalleVenta[] | null>(null);
  const [startDate, setStartDate] = useState<string>('');
  const [endDate, setEndDate] = useState<string>('');
  const [selectedVenta, setSelectedVenta] = useState<number | null>(null);

  const [usuarios, setUsuarios] = useState<
    Record<number, { nombre: string; apellido: string }>
  >({});
  const [productos, setProductos] = useState<Record<number, string>>({});

  // Estados para la paginación
  const [pagina, setPagina] = useState<number>(1);
  const [ventasPorPagina] = useState<number>(10);

  const fetchVentas = async () => {
    try {
      const response = await axios.get('/api/venta');
      const ventasData = response.data;

      const usuariosIds = [
        ...new Set(ventasData.map((venta: Venta) => venta.id_usuario)),
      ];

      const usuariosResponse = await Promise.all(
        usuariosIds.map((id) => axios.get(`/api/usuario/${id}`))
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
      const response = await axios.get(`/api/detalle-venta/${idVenta}`);
      const detalleVentaData = response.data;

      const productosIds = [
        ...new Set(
          detalleVentaData.map((detalle: DetalleVenta) => detalle.id_producto)
        ),
      ];

      const productosResponse = await Promise.all(
        productosIds.map((id) => axios.get(`/api/producto/${id}`))
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
        const response = await axios.get(`/api/venta`);
        setSelectedVenta(null);
        setPagina(1);
        setVentas(response.data);
        return;
      }

      if (!startDate || !endDate) {
        alert('Por favor, selecciona un rango de fechas completo');
        return;
      }

      const response = await axios.get(`/api/venta/filtro/fechas`, {
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
    fetchDetalleVenta(idVenta);
  };

  const handleFilterToday = () => {
    const today = new Date().toISOString().split('T')[0];
    setStartDate(today);
    setEndDate(today);
  };

  const handleFilterThisMonth = () => {
    const today = new Date();
    const firstDay = new Date(today.getFullYear(), today.getMonth(), 1)
      .toISOString()
      .split('T')[0];
    const lastDay = today.toISOString().split('T')[0];
    setStartDate(firstDay);
    setEndDate(lastDay);
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
    <div className="ventas-container">
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
            Filtrar Ventas Hoy
          </button>
          <button onClick={handleFilterThisMonth} className="btn-filtro-mes">
            Filtrar Ventas Este Mes
          </button>
        </div>
        <button onClick={handleGenerarReporte}>
          Generar reporte de ventas
        </button>
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
                {`${usuarios[venta.id_usuario]?.nombre || ''} ${
                  usuarios[venta.id_usuario]?.apellido || ''
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
        <div className="ventas-detalle">
          <h2>Detalle de la Venta {selectedVenta}</h2>
          <div className="ventas-detalle-info">
            <p>
              <strong>Vendedor:</strong>{' '}
              {`${
                usuarios[
                  ventas.find((venta) => venta.id_venta === selectedVenta)
                    ?.id_usuario || 0
                ]?.nombre || ''
              } ${
                usuarios[
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
              {detalleVenta.map((detalle) => (
                <tr key={detalle.id_producto}>
                  <td>{productos[detalle.id_producto]}</td>
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
              Monto extra: ${' '}
              {ventas.find((v) => v.id_venta === selectedVenta)?.monto_extra}
            </span>
          </h2>
          <h2>
            <span>
              Monto Total: $
              {ventas.find((v) => v.id_venta === selectedVenta)?.total}
            </span>
          </h2>
        </div>
      )}
    </div>
  );
};

export default Ventas;
