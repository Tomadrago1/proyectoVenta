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

  // Función para obtener las ventas con los usuarios
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
    if (!startDate || !endDate) {
      alert('Por favor, selecciona un rango de fechas');
      return;
    }
    try {
      console.log(startDate, endDate);
      const response = await axios.get(`/api/venta/filtro/fechas`, {
        params: { startDate, endDate },
      });
      setVentas(response.data);
    } catch (error) {
      console.error('Error al filtrar las ventas:', error);
    }
  };

  const handleSelectVenta = async (idVenta: number) => {
    setSelectedVenta(idVenta);
    fetchDetalleVenta(idVenta);
  };

  const handleGenerarReporte = () => {
    generateReport(ventas);
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
          <button type="submit">Filtrar</button>
        </form>

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
          {ventas.map((venta) => (
            <tr key={venta.id_venta}>
              <td>{venta.id_venta}</td>
              <td>
                {`${usuarios[venta.id_usuario]?.nombre || ''} ${
                  usuarios[venta.id_usuario]?.apellido || ''
                }`}
              </td>
              <td>{formatFechaHora(venta.fecha_venta)}</td>
              <td>${Number(venta.total).toFixed(2)}</td>
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
                  <td>${Number(detalle.precio_unitario).toFixed(2)}</td>
                  <td>
                    ${(detalle.cantidad * detalle.precio_unitario).toFixed(2)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          <h2>
            <span>
              Monto extra:{' '}
              {ventas.find((venta) => venta.id_venta === selectedVenta)
                ?.monto_extra || '0.00'}
            </span>
          </h2>
          <h2>
            <span>
              Total:{' '}
              {ventas.find((venta) => venta.id_venta === selectedVenta)
                ?.total || '0.00'}
            </span>
          </h2>
        </div>
      )}
    </div>
  );
};

export default Ventas;
