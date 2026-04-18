import { BarcodeConfigRepository } from '../repositories/barcodeConfig.repository';
import { ValueType } from '../models/barcodeConfig.model';

// ══════════════════════════════════════════════════════════════════════
// Tipos de respuesta del parser (Discriminated Union)
// ══════════════════════════════════════════════════════════════════════

/**
 * Código estándar: el sistema debe buscar el producto por
 * el código de barras completo en la tabla `productos`.
 */
export interface StandardBarcodeResult {
  type: 'STANDARD_BARCODE';
  barcode: string;
}

/**
 * Código de balanza (circulación restringida): el sistema debe buscar
 * el producto por el PLU interno y usar el `value` como precio final.
 *
 * Regla de negocio: el precio impreso por la balanza es la
 * "fuente de verdad" para evitar conflictos de redondeo en caja.
 */
export interface WeightedBarcodeResult {
  type: 'WEIGHTED_BARCODE';
  plu: string;
  value: number;
  valueType: ValueType;
  rawBarcode: string;
}

export type BarcodeParseResult = StandardBarcodeResult | WeightedBarcodeResult;

// ══════════════════════════════════════════════════════════════════════
// Excepciones del dominio
// ══════════════════════════════════════════════════════════════════════

export class BarcodeValidationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'BarcodeValidationError';
  }
}

// ══════════════════════════════════════════════════════════════════════
// Servicio Interceptor
// ══════════════════════════════════════════════════════════════════════

const EAN13_LENGTH = 13;
const DIGITS_ONLY = /^\d+$/;

export class BarcodeInterceptorService {
  constructor(private readonly repository: BarcodeConfigRepository) {}

  /**
   * Procesa un string leído por el escáner.
   *
   * @param rawBarcode - El string de 13 dígitos leído por el escáner.
   * @param tenantId   - ID del negocio (tenant).
   * @returns Resultado discriminado: STANDARD_BARCODE o WEIGHTED_BARCODE.
   * @throws BarcodeValidationError si el código es inválido.
   *
   * @example
   * // Código de balanza con prefix "20", PLU 5 dígitos, precio 5 dígitos, 2 decimales
   * parse("2000045012507", 1)
   * // → { type: 'WEIGHTED_BARCODE', plu: '00045', value: 12.50, valueType: 'PRICE', rawBarcode: '2000045012507' }
   *
   * @example
   * // Código estándar (no coincide con ningún prefix configurado)
   * parse("7790895000782", 1)
   * // → { type: 'STANDARD_BARCODE', barcode: '7790895000782' }
   */
  public async parse(rawBarcode: string, tenantId: number): Promise<BarcodeParseResult> {
    // ── 1. Validar formato ──────────────────────────────────────────
    this.validateFormat(rawBarcode);

    // ── 2. Extraer prefijo y buscar configuración ───────────────────
    // Por ahora usamos los primeros 2 dígitos como prefijo estándar.
    // Si en el futuro se necesitan prefijos de diferente longitud,
    // se puede iterar sobre longitudes posibles.
    const prefix = rawBarcode.substring(0, 2);

    const config = await this.repository.findByTenantAndPrefix(tenantId, prefix);

    // ── 3. Si NO coincide → código estándar ─────────────────────────
    if (!config) {
      return {
        type: 'STANDARD_BARCODE',
        barcode: rawBarcode,
      };
    }

    // ── 4. Si SÍ coincide → parsear según configuración ─────────────
    const prefixLength = config.prefix.length;
    const pluStart = prefixLength;
    const pluEnd = pluStart + config.plu_length;
    const valueStart = pluEnd;
    const valueEnd = valueStart + config.value_length;

    // Extraer campos (ignorando el último dígito verificador)
    const plu = rawBarcode.substring(pluStart, pluEnd);
    const rawValue = rawBarcode.substring(valueStart, valueEnd);

    // Validar que el valor extraído contiene solo dígitos
    if (!DIGITS_ONLY.test(rawValue)) {
      throw new BarcodeValidationError(
        `El valor extraído "${rawValue}" contiene caracteres no numéricos`,
      );
    }

    // ── 5. Decodificar valor numérico ───────────────────────────────
    // Ej: rawValue="01250", decimal_places=2 → 1250 / 100 = 12.50
    const intValue = Number.parseInt(rawValue, 10);
    const divisor = Math.pow(10, config.decimal_places);
    const decodedValue = intValue / divisor;

    return {
      type: 'WEIGHTED_BARCODE',
      plu,
      value: decodedValue,
      valueType: config.value_type as ValueType,
      rawBarcode,
    };
  }

  // ── Validaciones privadas ───────────────────────────────────────

  private validateFormat(barcode: string): void {
    if (!barcode || barcode.length !== EAN13_LENGTH) {
      throw new BarcodeValidationError(
        `El código de barras debe tener exactamente ${EAN13_LENGTH} dígitos. ` +
        `Se recibieron ${barcode?.length ?? 0} caracteres.`,
      );
    }

    if (!DIGITS_ONLY.test(barcode)) {
      throw new BarcodeValidationError(
        'El código de barras debe contener únicamente dígitos numéricos.',
      );
    }
  }
}
