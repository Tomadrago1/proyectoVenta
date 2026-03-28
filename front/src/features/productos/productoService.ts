import api from '../../shared/api/api';
import { Producto } from './producto.interface';
import { API_URL } from '../../shared/api/api';

const PRODUCTO_API_URL = `${API_URL}/producto`;

export const productoService = {
  getAll: async (): Promise<Producto[]> => {
    const response = await api.get(PRODUCTO_API_URL);
    return response.data;
  },

  getById: async (id: string): Promise<Producto> => {
    const response = await api.get(`${PRODUCTO_API_URL}/${id}`);
    return response.data;
  },

  search: async (searchTerm: string): Promise<Producto[]> => {
    const response = await api.get(`${PRODUCTO_API_URL}/search/${searchTerm}`);
    return response.data;
  },

  create: async (producto: Producto): Promise<Producto> => {
    const response = await api.post(PRODUCTO_API_URL, producto);
    return response.data;
  },

  update: async (id: string, producto: Producto): Promise<Producto> => {
    const response = await api.put(`${PRODUCTO_API_URL}/${id}`, producto);
    return response.data;
  },

  updateStock: async (id: string, newStock: number): Promise<Producto> => {
    const response = await api.put(`${PRODUCTO_API_URL}/stock/${id}/${newStock}`);
    return response.data;
  },

  delete: async (id: string): Promise<void> => {
    await api.delete(`${PRODUCTO_API_URL}/${id}`);
  },
};
