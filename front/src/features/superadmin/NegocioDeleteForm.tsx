import React, { useState } from 'react';
import { negocioService } from './negocioService';

interface Props {
    negocioId: string;
    onSuccess: () => void;
    onCancel: () => void;
}

const NegocioDeleteForm: React.FC<Props> = ({ negocioId, onSuccess, onCancel }) => {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const handleDelete = async () => {
        try {
            setLoading(true);
            await negocioService.delete(negocioId);
            onSuccess();
        } catch (err: any) {
            setError(err.response?.data?.message || 'Error al eliminar el negocio (asegúrese de que no tenga dependencias)');
            setLoading(false);
        }
    };

    return (
        <div className="modal-form" style={{ textAlign: 'center' }}>
            <h2>Eliminar Negocio</h2>
            <p>¿Está seguro de que desea eliminar este negocio de forma permanente?</p>
            <p style={{ color: 'red', fontSize: '0.9em' }}>
                Advertencia: Esta acción fallará si el negocio tiene usuarios, productos o ventas asociadas
                debido a las restricciones de integridad. Deberá limpiarlas primero.
            </p>
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

export default NegocioDeleteForm;
