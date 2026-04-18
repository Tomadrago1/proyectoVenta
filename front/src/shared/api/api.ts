import axios from 'axios';

// baseURL '/api' se combina con todas las rutas automáticamente.
// API_URL se exporta vacío por compatibilidad con los servicios existentes
// que hacen api.get(`${API_URL}/ruta`) — así queda api.get('/ruta') → '/api/ruta'.
export const API_URL = '';

const api = axios.create({
    baseURL: '/api',
    timeout: 10000,
});

api.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('token');
        if (token) {
            config.headers['Authorization'] = `Bearer ${token}`;
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

api.interceptors.response.use(
    (response) => {
        return response;
    },
    (error) => {
        if (axios.isAxiosError(error) && error.response?.status === 401) {
            console.warn('Sesión expirada o token inválido.');
            localStorage.removeItem('token');
            window.dispatchEvent(new CustomEvent('auth:unauthorized'));
        }

        return Promise.reject(error);
    }
);

export default api;
