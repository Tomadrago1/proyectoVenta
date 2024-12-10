export interface DetalleVenta {
  id_producto: number,
  id_venta: number | null,
  cantidad: number,
  precio_unitario: number,
}