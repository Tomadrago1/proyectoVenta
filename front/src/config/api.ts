import axios from 'axios';

const isLocalhost = window.location.hostname === 'localhost';
const networkHost = typeof __API_HOST__ === 'string' && __API_HOST__.trim()
    ? __API_HOST__
    : '192.168.100.5';

export const API_URL = isLocalhost
    ? 'http://localhost:3000/api'
    : `http://${networkHost}:3000/api`;

// Instancia de Axios
const api = axios.create({
    baseURL: API_URL,
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
            // Dispara un evento para que useAuth limpie el estado y redirija sin
            // hacer un full-reload de la página (window.location.href).
            window.dispatchEvent(new CustomEvent('auth:unauthorized'));
        }

        return Promise.reject(error);
    }
);

export default api;