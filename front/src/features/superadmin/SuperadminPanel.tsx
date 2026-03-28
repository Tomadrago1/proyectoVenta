import React, { useState, useRef } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPlus, faPen, faTrash } from '@fortawesome/free-solid-svg-icons';
import { useNegocios } from './useNegocios';
import NegocioCreateForm from './NegocioCreateForm';
import NegocioEditForm from './NegocioEditForm';
import NegocioDeleteForm from './NegocioDeleteForm';
import './SuperadminPanel.css';

const SuperadminPanel: React.FC = () => {
    const { negocios, loading, error, fetchNegocios } = useNegocios();
    const [selectedAction, setSelectedAction] = useState<string>('');
    const [selectedNegocioId, setSelectedNegocioId] = useState<string>('');
    const formRef = useRef<HTMLDivElement | null>(null);

    const handleActionClick = (action: string, negocioId: string = '') => {
        setSelectedAction(action);
        setSelectedNegocioId(negocioId);
        setTimeout(() => {
            formRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }, 100);
    };

    const handleSuccess = () => {
        setSelectedAction('');
        setSelectedNegocioId('');
        fetchNegocios();
    };

    const handleCancel = () => {
        setSelectedAction('');
        setSelectedNegocioId('');
    };

    if (loading) return <div>Cargando negocios...</div>;
    if (error) return <div>Error: {error}</div>;

    return (
        <div className="container_superadmin">
            <h1>Panel Global: Gestión de Negocios</h1>
            
            <div className="action-buttons">
                <button className="create-button" onClick={() => handleActionClick('crear')}>
                    <FontAwesomeIcon icon={faPlus} /> Registrar Negocio
                </button>
            </div>

            <table className="negocios-table">
                <thead>
                    <tr>
                        <th>ID Negocio</th>
                        <th>Nombre del Negocio</th>
                        <th>Fecha Registro</th>
                        <th>Acciones</th>
                    </tr>
                </thead>
                <tbody>
                    {negocios.map(neg => (
                        <tr key={neg.id_negocio}>
                            <td>{neg.id_negocio}</td>
                            <td>{neg.nombre_negocio}</td>
                            <td>{new Date(neg.fecha_registro || Date.now()).toLocaleDateString()}</td>
                            <td>
                                <button className="update-button" onClick={() => handleActionClick('editar', String(neg.id_negocio))}>
                                    <FontAwesomeIcon icon={faPen} /> Editar
                                </button>
                                &nbsp;
                                <button className="delete-button" onClick={() => handleActionClick('eliminar', String(neg.id_negocio))}>
                                    <FontAwesomeIcon icon={faTrash} /> Eliminar
                                </button>
                            </td>
                        </tr>
                    ))}
                    {negocios.length === 0 && (
                        <tr>
                            <td colSpan={4} style={{ textAlign: 'center' }}>No hay negocios registrados en el sistema.</td>
                        </tr>
                    )}
                </tbody>
            </table>

            {selectedAction && (
                <div ref={formRef}>
                    {selectedAction === 'crear' && (
                        <NegocioCreateForm onSuccess={handleSuccess} onCancel={handleCancel} />
                    )}
                    {selectedAction === 'editar' && (
                        <NegocioEditForm negocioId={selectedNegocioId} onSuccess={handleSuccess} onCancel={handleCancel} />
                    )}
                    {selectedAction === 'eliminar' && (
                        <NegocioDeleteForm negocioId={selectedNegocioId} onSuccess={handleSuccess} onCancel={handleCancel} />
                    )}
                </div>
            )}
        </div>
    );
};

export default SuperadminPanel;
