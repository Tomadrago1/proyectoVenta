import api from '../../shared/api/api';
import { PrinterConfig, PrinterConfigFormData, TicketData } from './printerConfig.interface';

const BASE = '/printer-config';

export const printerConfigService = {
  get: async (): Promise<PrinterConfig | null> => {
    const response = await api.get(`${BASE}/config`);
    return response.data;
  },

  save: async (data: PrinterConfigFormData): Promise<PrinterConfig> => {
    const response = await api.put(`${BASE}/config`, data);
    return response.data;
  },

  remove: async (): Promise<void> => {
    await api.delete(`${BASE}/config`);
  },

  getTicketData: async (idVenta: number): Promise<TicketData> => {
    const response = await api.get(`${BASE}/ticket-data/${idVenta}`);
    return response.data;
  },
};
