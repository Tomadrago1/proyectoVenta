export class DetalleVentaGenerico {
  constructor(
    public id_detalle_generico: number | null,
    public id_negocio: number,
    public id_venta: number,
    public cantidad: number,
    public precio_unitario: number,
    public descripcion: string,
  ) { }
}
