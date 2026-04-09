import React, { useState } from 'react';
import { superadminUserService } from './superadminUserService';
import { Usuario } from '../auth/usuario.interface';

interface Props {
    negocioId: string;
    onSuccess: () => void;
    onCancel: () => void;
}

const NegocioAddAdminForm: React.FC<Props> = ({ negocioId, onSuccess, onCancel }) => {
    const [formData, setFormData] = useState<Partial<Usuario>>({
        nombre: '',
        apellido: '',
        username: '',
        contrasena: '',
        id_rol: 1 // Rol 1 = Administrador (fuerza la creación del admin inicial)
    });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            setLoading(true);
            await superadminUserService.createForNegocio(negocioId, formData as Usuario);
            onSuccess();
        } catch (err: any) {
            setError(err.response?.data?.message || 'Error al crear el administrador');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="modal-form">
            <h2>Crear Administrador del Negocio</h2>
            <p style={{ color: 'var(--pos-text-secondary)', marginBottom: '20px', fontSize: '14px' }}>
                Esto creará el primer usuario Administrador para el negocio ID: {negocioId}.
            </p>
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
                    <label>Nombre de Usuario (Username):</label>
                    <input type="text" name="username" value={formData.username} onChange={handleChange} required />
                </div>
                <div className="form-group">
                    <label>Contraseña:</label>
                    <input type="password" name="contrasena" value={formData.contrasena} onChange={handleChange} required />
                </div>
                <div className="form-actions">
                    <button type="button" className="btn-secondary" onClick={onCancel}>Cancelar</button>
                    <button type="submit" className="btn-primary" disabled={loading}>Crear Administrador</button>
                </div>
            </form>
        </div>
    );
};

export default NegocioAddAdminForm;
