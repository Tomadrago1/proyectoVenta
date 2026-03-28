import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from './useAuth';

interface ProtectedRouteProps {
    children: React.ReactNode;
    requiredRoles?: string[];
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children, requiredRoles }) => {
    const { isAuthenticated, loading, user } = useAuth();

    if (loading) {
        return (
            <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
                <span>Verificando sesión...</span>
            </div>
        );
    }

    if (!isAuthenticated) {
        return <Navigate to="/" replace />;
    }

    if (requiredRoles && user && !requiredRoles.includes(user.nombre_rol)) {
        return <Navigate to="/unauthorized" replace />;
    }

    return <>{children}</>;
};

export default ProtectedRoute;
