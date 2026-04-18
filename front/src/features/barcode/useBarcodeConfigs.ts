import { useState, useEffect, useCallback } from 'react';
import { BarcodeConfig } from './barcode.interface';
import { barcodeConfigService } from './barcodeConfigService';

export const useBarcodeConfigs = () => {
  const [configs, setConfigs] = useState<BarcodeConfig[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const fetchConfigs = useCallback(async () => {
    try {
      setLoading(true);
      const data = await barcodeConfigService.getAll();
      setConfigs(data);
      setError(null);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Error al obtener las configuraciones');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchConfigs();
  }, [fetchConfigs]);

  return {
    configs,
    loading,
    error,
    fetchConfigs,
  };
};
