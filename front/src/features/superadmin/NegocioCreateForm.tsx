import React, { useState } from 'react';
import { Negocio, negocioService } from './negocioService';

interface Props {
    onSuccess: () => void;
    onCancel: () => void;
}

const NegocioCreateForm: React.FC<Props> = ({ onSuccess, onCancel }) => {
    const [nombreNegocio, setNombreNegocio] = useState('');
    const [ciudad, setCiudad] = useState('');
    const [direccion, setDireccion] = useState('');
    const [telefono, setTelefono] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            setLoading(true);
            await negocioService.create({ 
                nombre_negocio: nombreNegocio,
                ciudad,
                direccion,
                telefono
            });
            onSuccess();
        } catch (err: any) {
            setError(err.response?.data?.message || 'Error al registrar el negocio');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="modal-form">
            <h2>Registrar Nuevo Negocio</h2>
            {error && <div style={{ color: 'red', marginBottom: '10px' }}>{error}</div>}
            <form onSubmit={handleSubmit}>
                <div className="form-group">
                    <label>Nombre del Negocio:</label>
                    <input 
                        type="text" 
                        value={nombreNegocio} 
                        onChange={(e) => setNombreNegocio(e.target.value)} 
                        required 
                        maxLength={100}
                    />
                </div>
                <div className="form-group">
                    <label>Ciudad:</label>
                    <input 
                        type="text" 
                        value={ciudad} 
                        onChange={(e) => setCiudad(e.target.value)} 
                        required 
                        maxLength={100}
                    />
                </div>
                <div className="form-group">
                    <label>Dirección:</label>
                    <input 
                        type="text" 
                        value={direccion} 
                        onChange={(e) => setDireccion(e.target.value)} 
                        required 
                        maxLength={100}
                    />
                </div>
                <div className="form-group">
                    <label>Teléfono:</label>
                    <input 
                        type="text" 
                        value={telefono} 
                        onChange={(e) => setTelefono(e.target.value)} 
                        required 
                        maxLength={20}
                    />
                </div>
                <div className="form-actions">
                    <button type="button" className="btn-secondary" onClick={onCancel}>Cancelar</button>
                    <button type="submit" className="btn-primary" disabled={loading}>Registrar Negocio</button>
                </div>
            </form>
        </div>
    );
};

export default NegocioCreateForm;
