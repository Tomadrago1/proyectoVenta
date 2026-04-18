export interface BarcodeConfig {
  id_config: number;
  id_negocio: number;
  prefix: string;
  plu_length: number;
  value_length: number;
  value_type: 'PRICE' | 'WEIGHT';
  decimal_places: number;
  descripcion: string | null;
  activo: boolean;
}

export interface BarcodeConfigFormData {
  prefix: string;
  plu_length: number;
  value_length: number;
  value_type: 'PRICE' | 'WEIGHT';
  decimal_places: number;
  descripcion: string;
}

// ── Resultado del parser local ──────────────────────────────────────

export interface StandardBarcodeResult {
  type: 'STANDARD_BARCODE';
  barcode: string;
}

export interface WeightedBarcodeResult {
  type: 'WEIGHTED_BARCODE';
  plu: string;
  value: number;
  valueType: 'PRICE' | 'WEIGHT';
  rawBarcode: string;
}

export type BarcodeParseResult = StandardBarcodeResult | WeightedBarcodeResult;
