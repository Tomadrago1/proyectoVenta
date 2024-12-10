export class DetalleVenta {
  constructor(
    public id_producto: number,
    public id_venta: number,
    public cantidad: number,
    public precio_unitario: number,
  ) { }
}