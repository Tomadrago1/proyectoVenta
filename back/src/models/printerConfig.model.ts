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

export const PAPER_COLUMNS: Record<PaperWidth, number> = {
  '58mm': 32,
  '80mm': 48,
};
