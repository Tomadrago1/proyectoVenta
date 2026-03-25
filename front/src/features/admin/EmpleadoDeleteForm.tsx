import React, { useState } from 'react';
import { empleadoService } from './empleadoService';

interface Props {
    empleadoId: string;
    onSuccess: () => void;
    onCancel: () => void;
}

const EmpleadoDeleteForm: React.FC<Props> = ({ empleadoId, onSuccess, onCancel }) => {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const handleDelete = async () => {
        try {
            setLoading(true);
            await empleadoService.delete(empleadoId);
            onSuccess();
        } catch (err: any) {
            setError(err.response?.data?.message || 'Error al eliminar el empleado');
            setLoading(false);
        }
    };

    return (
        <div className="modal-form" style={{ textAlign: 'center' }}>
            <h2>Eliminar Empleado</h2>
            <p>¿Está seguro de que desea eliminar a este empleado?</p>
            {error && <div style={{ color: 'red', margin: '10px 0' }}>{error}</div>}
            
            <div className="form-actions" style={{ justifyContent: 'center' }}>
                <button type="button" className="btn-secondary" onClick={onCancel} disabled={loading}>
                    Cancelar
                </button>
                <button type="button" className="btn-danger" onClick={handleDelete} disabled={loading}>
                    Confirmar Eliminación
                </button>
            </div>
        </div>
    );
};

export default EmpleadoDeleteForm;
