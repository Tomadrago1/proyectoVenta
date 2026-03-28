import React, { useState, useEffect } from 'react';
import { empleadoService } from './empleadoService';
import { Usuario } from '../auth/usuario.interface';

interface Props {
    empleadoId: string;
    onSuccess: () => void;
    onCancel: () => void;
}

const EmpleadoEditForm: React.FC<Props> = ({ empleadoId, onSuccess, onCancel }) => {
    const [formData, setFormData] = useState<Partial<Usuario>>({
        nombre: '',
        apellido: '',
        username: '',
        contrasena: '',
        id_rol: 2
    });
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState('');

    useEffect(() => {
        const loadEmpleado = async () => {
            try {
                setLoading(true);
                const emp = await empleadoService.getById(empleadoId);
                setFormData({
                    nombre: emp.nombre,
                    apellido: emp.apellido,
                    username: emp.username,
                    contrasena: '', // Dejar vacío, solo enviar si cambia
                    id_rol: emp.id_rol
                });
            } catch (err: any) {
                setError(err.response?.data?.message || 'Error al cargar empleado');
            } finally {
                setLoading(false);
            }
        };
        if (empleadoId) loadEmpleado();
    }, [empleadoId]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            setSaving(true);
            const dataToUpdate = { ...formData };
            // Si la contraseña está vacía, enviamos la misma que ya tiene o simplemente la ignoramos 
            // en el backend si viene vacía (o asumiendo que el controller pide una, enviamos la del state)
            // *Ojo: En este diseño, el backend requiere constrasena obligatoria en Update. 
            // Lo ideal es que si no cambia la contraseña devuelva la hasheada. Por simplicidad, 
            // si la dejan vacía mostraremos error o le decimos que la vuelva a escribir para confirmar.
            if (!dataToUpdate.contrasena) {
                setError('Debe ingresar la contraseña actual o una nueva para guardar cambios.');
                setSaving(false);
                return;
            }
            await empleadoService.update(empleadoId, dataToUpdate as Usuario);
            onSuccess();
        } catch (err: any) {
            setError(err.response?.data?.message || 'Error al actualizar empleado');
        } finally {
            setSaving(false);
        }
    };

    if (loading) return <div className="modal-form">Cargando datos...</div>;

    return (
        <div className="modal-form">
            <h2>Editar Empleado</h2>
            {error && <div style={{ color: 'red', marginBottom: '10px' }}>{error}</div>}
            <form onSubmit={handleSubmit}>
                <div className="form-group">
                    <label>Nombre:</label>
                    <input type="text" name="nombre" value={formData.nombre} onChange={handleChange} required />
                </div>
                <div className="form-group">
                    <label>Apellido:</label>
                    <input type="text" name="apellido" value={formData.apellido} onChange={handleChange} required />
                </div>
                <div className="form-group">
                    <label>Nombre de Usuario:</label>
                    <input type="text" name="username" value={formData.username} onChange={handleChange} required />
                </div>
                <div className="form-group">
                    <label>Contraseña (Obligatoria para confirmar la edición):</label>
                    <input type="password" name="contrasena" value={formData.contrasena} onChange={handleChange} required />
                </div>
                <div className="form-group">
                    <label>Rol:</label>
                    <select name="id_rol" value={formData.id_rol} onChange={handleChange}>
                        <option value={2}>Empleado</option>
                        <option value={1}>Administrador</option>
                    </select>
                </div>
                <div className="form-actions">
                    <button type="button" className="btn-secondary" onClick={onCancel}>Cancelar</button>
                    <button type="submit" className="btn-primary" disabled={saving}>Guardar</button>
                </div>
            </form>
        </div>
    );
};

export default EmpleadoEditForm;
