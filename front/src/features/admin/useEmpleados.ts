import { useState, useEffect, useCallback } from 'react';
import { Usuario } from '../auth/usuario.interface';
import { empleadoService } from './empleadoService';
import { getRol } from '../../shared/utils/rol';

export const useEmpleados = () => {
    const [empleados, setEmpleados] = useState<Usuario[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);

    const fetchEmpleados = useCallback(async () => {
        try {
            setLoading(true);
            const data = await empleadoService.getAll();
            const dataWithRol = data.map((empleado: Usuario) => ({
                ...empleado,
                nombre_rol: getRol(empleado.id_rol)
            }));
            setEmpleados(dataWithRol);
            setError(null);
        } catch (err: any) {
            setError(err.response?.data?.message || 'Error al obtener los empleados');
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchEmpleados();
    }, [fetchEmpleados]);

    return {
        empleados,
        loading,
        error,
        fetchEmpleados,
    };
};
