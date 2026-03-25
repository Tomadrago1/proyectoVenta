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
            return null;
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

    const validateToken = useCallback(() => {
        const token = localStorage.getItem('token');

        if (!token) {
            setAuthState({ isAuthenticated: false, loading: false, user: null });
            navigate('/');
            return;
        }

        const payload = decodeAndValidateToken(token);

        if (!payload) {
            logout();
            return;
        }

        setAuthState({ isAuthenticated: true, loading: false, user: payload });
    }, [navigate, logout]);

    useEffect(() => {
        validateToken();

        const interval = setInterval(validateToken, TOKEN_CHECK_INTERVAL_MS);

        const handleUnauthorized = () => logout();
        window.addEventListener('auth:unauthorized', handleUnauthorized);

        return () => {
            clearInterval(interval);
            window.removeEventListener('auth:unauthorized', handleUnauthorized);
        };
    }, [validateToken, logout]);

    return { ...authState, logout };
};
