export interface Producto {
  id_producto: string;
  id_categoria: string;
  nombre_producto: string;
  precio_compra: number;
  precio_venta: number;
  stock: number;
  codigo_barras: string;
}