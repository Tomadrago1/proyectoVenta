export class Venta {
  constructor(
    public id_usuario: number,
    public id_venta: number | null,
    public total: number,
    public fecha_venta: Date,
  ) { }
}
