import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Venta } from '../interface/venta';
import { DetalleVenta } from '../interface/detalleVenta';
import { formatFechaHora } from '../utils/fechaConverter';

const Ventas: React.FC = () => {
  const [ventas, setVentas] = useState<Venta[]>([]);
  const [detalleVenta, setDetalleVenta] = useState<DetalleVenta[] | null>(null);
  const [startDate, setStartDate] = useState<string>('');
  const [endDate, setEndDate] = useState<string>('');
  const [selectedVenta, setSelectedVenta] = useState<number | null>(null);

  const [usuarios, setUsuarios] = useState<Record<number, { nombre: string; apellido: string }>>({});
  const [productos, setProductos] = useState<Record<number, string>>({});

  // Función para obtener las ventas con los usuarios
  const fetchVentas = async () => {
    try {
      const response = await axios.get('/api/venta');
      const ventasData = response.data;

      // Extraer IDs de usuarios
      const usuariosIds = [...new Set(ventasData.map((venta: Venta) => venta.id_usuario))];

      // Hacer una llamada al backend para obtener los usuarios
      const usuariosResponse = await Promise.all(
        usuariosIds.map((id) => axios.get(`/api/usuario/${id}`))
      );

      // Almacenar los usuarios en su estado respectivo
      const usuariosMap = usuariosResponse.reduce(
        (acc, curr) => ({
          ...acc,
          [curr.data.id_usuario]: { nombre: curr.data.nombre, apellido: curr.data.apellido },
        }),
        {}
      );

      setUsuarios(usuariosMap);
      setVentas(ventasData);
    } catch (error) {
      console.error('Error al cargar las ventas o los usuarios:', error);
    }
  };

  // Función para obtener los productos del detalle de una venta
  const fetchDetalleVenta = async (idVenta: number) => {
    try {
      const response = await axios.get(`/api/detalle-venta/${idVenta}`);
      const detalleVentaData = response.data;

      // Extraer IDs de productos
      const productosIds = [
        ...new Set(detalleVentaData.map((detalle: DetalleVenta) => detalle.id_producto)),
      ];

      // Hacer una llamada al backend para obtener los productos
      const productosResponse = await Promise.all(
        productosIds.map((id) => axios.get(`/api/producto/${id}`))
      );

      // Almacenar los productos en su estado respectivo
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
      console.error('Error al cargar el detalle de la venta o los productos:', error);
    }
  };

  // Use effect para cargar las ventas y usuarios al iniciar
  useEffect(() => {
    fetchVentas();
  }, []);

  // Función para filtrar las ventas por fechas
  const handleFilter = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!startDate || !endDate) {
      alert('Por favor, selecciona un rango de fechas');
      return;
    }
    try {
      const response = await axios.get(`/api/venta/filtro/fechas`, {
        params: { startDate, endDate },
      });
      setVentas(response.data);
    } catch (error) {
      console.error('Error al filtrar las ventas:', error);
    }
  };

  // Función al seleccionar una venta para cargar el detalle de la venta
  const handleSelectVenta = async (idVenta: number) => {
    setSelectedVenta(idVenta);
    fetchDetalleVenta(idVenta);
  };

  return (
    <div>
      <h1>Historial de Ventas</h1>
      <form onSubmit={handleFilter} style={{ marginBottom: '20px' }}>
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

      <table border={1} style={{ width: '100%', marginBottom: '20px' }}>
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
                {`${usuarios[venta.id_usuario]?.nombre || ''} ${usuarios[venta.id_usuario]?.apellido || ''}`}
              </td>
              <td>{formatFechaHora(venta.fecha_venta)}</td>
              <td>${Number(venta.total).toFixed(2)}</td>
              <td>
                <button onClick={() => venta.id_venta !== null && handleSelectVenta(venta.id_venta)}>
                  Ver Detalle
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {detalleVenta && selectedVenta && (
        <div>
          <h2>Detalle de la Venta #{selectedVenta}</h2>
          <table border={1} style={{ width: '100%' }}>
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
                  <td>{productos[detalle.id_producto]}</td> {/* Aquí mostramos el nombre del producto */}
                  <td>{detalle.cantidad}</td>
                  <td>${Number(detalle.precio_unitario).toFixed(2)}</td>
                  <td>${(detalle.cantidad * detalle.precio_unitario).toFixed(2)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default Ventas;
