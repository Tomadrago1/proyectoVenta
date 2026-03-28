import { useState, useEffect, useCallback } from 'react';
import { Negocio, negocioService } from './negocioService';

export const useNegocios = () => {
    const [negocios, setNegocios] = useState<Negocio[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);

    const fetchNegocios = useCallback(async () => {
        try {
            setLoading(true);
            const data = await negocioService.getAll();
            setNegocios(data);
            setError(null);
        } catch (err: any) {
            setError(err.response?.data?.message || 'Error al obtener los negocios');
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchNegocios();
    }, [fetchNegocios]);

    return {
        negocios,
        loading,
        error,
        fetchNegocios,
    };
};
