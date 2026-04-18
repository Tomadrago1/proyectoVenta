export type PaperWidth = '58mm' | '80mm';

export interface PrinterConfig {
  id_config: number;
  id_negocio: number;
  paper_width: PaperWidth;
  vendor_id: number | null;
  product_id: number | null;
  printer_name: string | null;
  columns_count: number;
  created_at?: string;
  updated_at?: string;
}

export interface PrinterConfigFormData {
  paper_width: PaperWidth;
  vendor_id: number | null;
  product_id: number | null;
  printer_name: string | null;
}

export interface DetalleTicket {
  cantidad: number;
  precio_unitario: number;
  nombre_producto: string;
}

export interface NegocioTicket {
  nombre_negocio: string;
  ciudad: string;
  direccion: string;
  telefono: string;
}

export interface TicketData {
  detalles: DetalleTicket[];
  negocio: NegocioTicket;
  printerConfig: PrinterConfig | null;
}
