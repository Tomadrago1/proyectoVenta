import api, { API_URL } from '../../shared/api/api';
import { Usuario } from '../auth/usuario.interface';

export const superadminUserService = {
    getAllByNegocio: async (idNegocio: string): Promise<Usuario[]> => {
        const response = await api.get(`${API_URL}/usuario`, { params: { id_negocio: idNegocio } });
        return response.data;
    },
    
    createForNegocio: async (idNegocio: string, usuario: Partial<Usuario>): Promise<Usuario> => {
        const response = await api.post(`${API_URL}/usuario`, { ...usuario, id_negocio: idNegocio });
        return response.data;
    },
    
    updateForNegocio: async (idNegocio: string, idUsuario: string, usuario: Partial<Usuario>): Promise<Usuario> => {
        const response = await api.put(`${API_URL}/usuario/${idUsuario}`, { ...usuario, id_negocio: idNegocio });
        return response.data;
    },
    
    deleteForNegocio: async (idNegocio: string, idUsuario: string): Promise<void> => {
        await api.delete(`${API_URL}/usuario/${idUsuario}`, { params: { id_negocio: idNegocio } });
    }
};
