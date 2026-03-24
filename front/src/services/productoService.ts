import axios from 'axios';
import { Producto } from '../interface/producto';

const API_URL = 'http://localhost:3000/api/producto';

export const productoService = {
  getAll: async (): Promise<Producto[]> => {
    const response = await axios.get(API_URL);
    return response.data;
  },

  getById: async (id: string): Promise<Producto> => {
    const response = await axios.get(`${API_URL}/${id}`);
    return response.data;
  },

  search: async (searchTerm: string): Promise<Producto[]> => {
    const response = await axios.get(`${API_URL}/search/${searchTerm}`);
    return response.data;
  },

  create: async (producto: Producto): Promise<Producto> => {
    const response = await axios.post(API_URL, producto);
    return response.data;
  },

  update: async (id: string, producto: Producto): Promise<Producto> => {
    const response = await axios.put(`${API_URL}/${id}`, producto);
    return response.data;
  },

  updateStock: async (id: string, newStock: number): Promise<Producto> => {
    const response = await axios.put(`${API_URL}/stock/${id}/${newStock}`);
    return response.data;
  },

  delete: async (id: string): Promise<void> => {
    await axios.delete(`${API_URL}/${id}`);
  },
};
