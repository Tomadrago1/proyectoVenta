import api, { API_URL } from '../../shared/api/api';

export interface Negocio {
    id_negocio: number;
    nombre_negocio: string;
    ciudad: string;
    direccion: string;
    telefono: string;
    fecha_registro?: string;
}

export const negocioService = {
    getAll: async (): Promise<Negocio[]> => {
        const response = await api.get(`${API_URL}/negocio`);
        return response.data;
    },
    
    getById: async (id: string): Promise<Negocio> => {
        const response = await api.get(`${API_URL}/negocio/${id}`);
        return response.data;
    },
    
    create: async (negocio: Partial<Negocio>): Promise<Negocio> => {
        const response = await api.post(`${API_URL}/negocio`, negocio);
        return response.data;
    },
    
    update: async (id: string, negocio: Partial<Negocio>): Promise<Negocio> => {
        const response = await api.put(`${API_URL}/negocio/${id}`, negocio);
        return response.data;
    },
    
    delete: async (id: string): Promise<void> => {
        await api.delete(`${API_URL}/negocio/${id}`);
    }
};
