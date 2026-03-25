import { useEffect, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';

interface AuthState {
    isAuthenticated: boolean;
    loading: boolean;
    user: any | null;
}


const TOKEN_CHECK_INTERVAL_MS = 30_000;

function decodeAndValidateToken(token: string): Record<string, any> | null {
    const parts = token.split('.');
    if (parts.length !== 3) return null;

    try {
        const normalizedPayload = parts[1].replace(/-/g, '+').replace(/_/g, '/');
        const paddedPayload = normalizedPayload + '='.repeat((4 - (normalizedPayload.length % 4)) % 4);
        const payload = JSON.parse(atob(paddedPayload));

        const nowInSeconds = Math.floor(Date.now() / 1000);
        if (typeof payload?.exp === 'number' && payload.exp <= nowInSeconds) {
            return null; // Token expirado
        }

        return payload;
    } catch {
        return null;
    }
}

export const useAuth = () => {
    const navigate = useNavigate();
    const [authState, setAuthState] = useState<AuthState>({
        isAuthenticated: false,
        loading: true,
        user: null,
    });

    const logout = useCallback(() => {
        localStorage.removeItem('token');
        setAuthState({ isAuthenticated: false, loading: false, user: null });
        navigate('/');
    }, [navigate]);

    /** Verifica el token actual; si es inválido/expirado hace logout. */
    const validateToken = useCallback(() => {
        const token = localStorage.getItem('token');

        if (!token) {
            setAuthState({ isAuthenticated: false, loading: false, user: null });
            navigate('/');
            return;
        }

        const payload = decodeAndValidateToken(token);

        if (!payload) {
            // Token con mal formato o expirado
            logout();
            return;
        }

        setAuthState({ isAuthenticated: true, loading: false, user: payload });
    }, [navigate, logout]);

    useEffect(() => {
        // Validación inicial al montar el componente
        validateToken();

        // Chequeo periódico para detectar expiración en tiempo real
        const interval = setInterval(validateToken, TOKEN_CHECK_INTERVAL_MS);

        // Escucha el evento disparado por el interceptor de Axios cuando el
        // backend responde 401 (token inválido o expirado según el servidor).
        const handleUnauthorized = () => logout();
        window.addEventListener('auth:unauthorized', handleUnauthorized);

        return () => {
            clearInterval(interval);
            window.removeEventListener('auth:unauthorized', handleUnauthorized);
        };
    }, [validateToken, logout]);

    return authState;
};
