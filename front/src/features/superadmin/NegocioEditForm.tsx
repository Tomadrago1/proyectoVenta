import React, { useState, useEffect } from 'react';
import { Negocio, negocioService } from './negocioService';

interface Props {
    negocioId: string;
    onSuccess: () => void;
    onCancel: () => void;
}

const NegocioEditForm: React.FC<Props> = ({ negocioId, onSuccess, onCancel }) => {
    const [nombreNegocio, setNombreNegocio] = useState('');
    const [ciudad, setCiudad] = useState('');
    const [direccion, setDireccion] = useState('');
    const [telefono, setTelefono] = useState('');
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState('');

    useEffect(() => {
        const loadNegocio = async () => {
            try {
                setLoading(true);
                const neg = await negocioService.getById(negocioId);
                setNombreNegocio(neg.nombre_negocio);
                setCiudad(neg.ciudad || '');
                setDireccion(neg.direccion || '');
                setTelefono(neg.telefono || '');
            } catch (err: any) {
                setError(err.response?.data?.message || 'Error al cargar el negocio');
            } finally {
                setLoading(false);
            }
        };
        if (negocioId) loadNegocio();
    }, [negocioId]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            setSaving(true);
            await negocioService.update(negocioId, { 
                nombre_negocio: nombreNegocio,
                ciudad,
                direccion,
                telefono
            });
            onSuccess();
        } catch (err: any) {
            setError(err.response?.data?.message || 'Error al actualizar el negocio');
        } finally {
            setSaving(false);
        }
    };

    if (loading) return <div className="modal-form">Cargando datos...</div>;

    return (
        <div className="modal-form">
            <h2>Editar Negocio</h2>
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
                    <button type="submit" className="btn-primary" disabled={saving}>Guardar Cambios</button>
                </div>
            </form>
        </div>
    );
};

export default NegocioEditForm;
