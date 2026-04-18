import api from '../../shared/api/api';
import { BarcodeConfig, BarcodeConfigFormData } from './barcode.interface';

const BASE = '/barcode/config';

export const barcodeConfigService = {
  getAll: async (): Promise<BarcodeConfig[]> => {
    const response = await api.get(BASE);
    return response.data;
  },

  getById: async (id: number): Promise<BarcodeConfig> => {
    const response = await api.get(`${BASE}/${id}`);
    return response.data;
  },

  create: async (data: BarcodeConfigFormData): Promise<BarcodeConfig> => {
    const response = await api.post(BASE, data);
    return response.data;
  },

  update: async (id: number, data: BarcodeConfigFormData): Promise<BarcodeConfig> => {
    const response = await api.put(`${BASE}/${id}`, data);
    return response.data;
  },

  delete: async (id: number): Promise<void> => {
    await api.delete(`${BASE}/${id}`);
  },
};
