export interface Venta {
  id_venta: number | null;
  id_usuario: number;
  fecha_venta: string;
  total: number;
  nombre_usuario?: string;
  apellido_usuario?: string;
}