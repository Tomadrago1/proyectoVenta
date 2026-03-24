const isLocalhost = window.location.hostname === 'localhost';
const networkHost = typeof __API_HOST__ === 'string' && __API_HOST__.trim()
    ? __API_HOST__
    : '192.168.100.5';

export const API_URL = isLocalhost
    ? 'http://localhost:3000/api'
    : `http://${networkHost}:3000/api`;
