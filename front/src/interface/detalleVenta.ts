export interface DetalleVenta {
  id_temp: number,
  id_producto: number,
  id_venta: number | null,
  cantidad: number,
  precio_unitario: number,
}