import api, { API_URL } from '../../shared/api/api';
import { Usuario } from '../auth/usuario.interface';

export const empleadoService = {
    getAll: async (): Promise<Usuario[]> => {
        const response = await api.get(`${API_URL}/usuario`);
        return response.data;
    },

    getById: async (id: string): Promise<Usuario> => {
        const response = await api.get(`${API_URL}/usuario/${id}`);
        return response.data;
    },

    create: async (usuario: Usuario): Promise<Usuario> => {
        console.log(usuario)
        const response = await api.post(`${API_URL}/usuario`, usuario);
        return response.data;
    },

    update: async (id: string, usuario: Usuario): Promise<Usuario> => {
        const response = await api.put(`${API_URL}/usuario/${id}`, usuario);
        return response.data;
    },

    delete: async (id: string): Promise<void> => {
        await api.delete(`${API_URL}/usuario/${id}`);
    }
};
