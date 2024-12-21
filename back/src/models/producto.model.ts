export class Producto {
  constructor(
    public id: number,
    public id_categoria: number,
    public nombre_producto: string,
    public precio_compra: number,
    public precio_venta: number,
    public stock: number,
    public codigo_barras: string,
  ) { }
}