import { useCallback } from 'react';
import { BarcodeConfig, BarcodeParseResult } from './barcode.interface';

const EAN13_LENGTH = 13;
const DIGITS_ONLY = /^\d+$/;

/**
 * Hook que provee un parser local de códigos EAN-13 de circulación restringida.
 *
 * El parsing se ejecuta 100% en el cliente para velocidad instantánea en caja.
 * Las configs se cargan una vez al montar el componente de venta.
 *
 * @param configs - Configuraciones activas del tenant (prefix, plu_length, etc.)
 * @returns `interceptBarcode` — función pura que parsea un código escaneado.
 *
 * @example
 * const { interceptBarcode } = useBarcodeInterceptor(configs);
 * const result = interceptBarcode('2000045012507');
 * // → { type: 'WEIGHTED_BARCODE', plu: '00045', value: 12.50, ... }
 */
export const useBarcodeInterceptor = (configs: BarcodeConfig[]) => {
  const interceptBarcode = useCallback(
    (rawBarcode: string): BarcodeParseResult => {
      // ── 1. Validar formato ────────────────────────────────────
      if (
        !rawBarcode ||
        rawBarcode.length !== EAN13_LENGTH ||
        !DIGITS_ONLY.test(rawBarcode)
      ) {
        // Si no es un EAN-13 válido, tratarlo como código estándar
        // y dejar que el flujo normal lo maneje (o falle en la API)
        return { type: 'STANDARD_BARCODE', barcode: rawBarcode };
      }

      // ── 2. Buscar config que coincida por prefijo ─────────────
      const matchedConfig = configs.find(
        (cfg) => cfg.activo && rawBarcode.startsWith(cfg.prefix)
      );

      // ── 3. Sin match → código estándar ────────────────────────
      if (!matchedConfig) {
        return { type: 'STANDARD_BARCODE', barcode: rawBarcode };
      }

      // ── 4. Parsear según configuración ────────────────────────
      const prefixLen = matchedConfig.prefix.length;
      const pluStart = prefixLen;
      const pluEnd = pluStart + matchedConfig.plu_length;
      const valueStart = pluEnd;
      const valueEnd = valueStart + matchedConfig.value_length;

      const plu = rawBarcode.substring(pluStart, pluEnd);
      const rawValue = rawBarcode.substring(valueStart, valueEnd);

      // ── 5. Decodificar valor numérico ─────────────────────────
      const intValue = parseInt(rawValue, 10);
      const divisor = Math.pow(10, matchedConfig.decimal_places);
      const decodedValue = intValue / divisor;

      return {
        type: 'WEIGHTED_BARCODE',
        plu,
        value: decodedValue,
        valueType: matchedConfig.value_type,
        rawBarcode,
      };
    },
    [configs]
  );

  return { interceptBarcode };
};
