import React, { useState } from 'react';
import { empleadoService } from './empleadoService';
import { Usuario } from '../auth/usuario.interface';

interface Props {
    onSuccess: () => void;
    onCancel: () => void;
}

const EmpleadoCreateForm: React.FC<Props> = ({ onSuccess, onCancel }) => {
    const [formData, setFormData] = useState<Partial<Usuario>>({
        nombre: '',
        apellido: '',
        username: '',
        contrasena: '',
        id_rol: 2 // Por defecto rol 2 = Empleado
    });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            setLoading(true);
            await empleadoService.create(formData as Usuario);
            onSuccess();
        } catch (err: any) {
            setError(err.response?.data?.message || 'Error al crear empleado');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="modal-form">
            <h2>Crear Empleado</h2>
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
                    <label>Contraseña:</label>
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
                    <button type="submit" className="btn-primary" disabled={loading}>Crear</button>
                </div>
            </form>
        </div>
    );
};

export default EmpleadoCreateForm;
