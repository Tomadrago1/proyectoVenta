import { useEffect, useState, useCallback } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import api from '../../shared/api/api';

interface AuthState {
    isAuthenticated: boolean;
    loading: boolean;
    user: any | null;
}

const TOKEN_CHECK_INTERVAL_MS = 60_000;

export const useAuth = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const [authState, setAuthState] = useState<AuthState>({
        isAuthenticated: false,
        loading: true,
        user: null,
    });

    const logout = useCallback(async () => {
        try {
            await api.post('/usuario/logout');
        } catch (e) {
            console.error('Error cerrando sesión en backend', e);
        }
        setAuthState({ isAuthenticated: false, loading: false, user: null });
        navigate('/');
    }, [navigate]);

    const validateSession = useCallback(async () => {
        try {
            const response = await api.get('/usuario/me');
            if (response.data) {
                setAuthState({ isAuthenticated: true, loading: false, user: response.data });
            }
        } catch (error) {
            setAuthState({ isAuthenticated: false, loading: false, user: null });
            if (location.pathname !== '/') {
                 navigate('/');
            }
        }
    }, [navigate, location.pathname]);

    useEffect(() => {
        validateSession();

        const interval = setInterval(validateSession, TOKEN_CHECK_INTERVAL_MS);

        const handleUnauthorized = () => logout();
        window.addEventListener('auth:unauthorized', handleUnauthorized);

        return () => {
            clearInterval(interval);
            window.removeEventListener('auth:unauthorized', handleUnauthorized);
        };
    }, [validateSession, logout]);

    return { ...authState, logout };
};
