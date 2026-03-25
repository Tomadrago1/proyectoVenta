import React, { useState, useRef } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPlus, faPen, faTrash } from '@fortawesome/free-solid-svg-icons';
import { useEmpleados } from './useEmpleados';
import EmpleadoCreateForm from './EmpleadoCreateForm';
import EmpleadoEditForm from './EmpleadoEditForm';
import EmpleadoDeleteForm from './EmpleadoDeleteForm';
import './AdminPanel.css';

const AdminPanel: React.FC = () => {
    const { empleados, loading, error, fetchEmpleados } = useEmpleados();
    const [selectedAction, setSelectedAction] = useState<string>('');
    const [selectedEmpleadoId, setSelectedEmpleadoId] = useState<string>('');
    const formRef = useRef<HTMLDivElement | null>(null);

    const handleActionClick = (action: string, empleadoId: string = '') => {
        setSelectedAction(action);
        setSelectedEmpleadoId(empleadoId);
        setTimeout(() => {
            formRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }, 100);
    };

    const handleSuccess = () => {
        setSelectedAction('');
        setSelectedEmpleadoId('');
        fetchEmpleados();
    };

    const handleCancel = () => {
        setSelectedAction('');
        setSelectedEmpleadoId('');
    };

    if (loading) return <div>Cargando empleados...</div>;
    if (error) return <div>Error: {error}</div>;

    return (
        <div className="container_admin">
            <h1>Panel Administrativo: Gestión de Empleados</h1>
            
            <div className="action-buttons">
                <button className="create-button" onClick={() => handleActionClick('crear')}>
                    <FontAwesomeIcon icon={faPlus} /> Crear Empleado
                </button>
            </div>

            <table className="empleados-table">
                <thead>
                    <tr>
                        <th>ID</th>
                        <th>Nombre</th>
                        <th>Apellido</th>
                        <th>Username</th>
                        <th>Rol</th>
                        <th>Acciones</th>
                    </tr>
                </thead>
                <tbody>
                    {empleados.map(emp => (
                        <tr key={emp.id_usuario}>
                            <td>{emp.id_usuario}</td>
                            <td>{emp.nombre}</td>
                            <td>{emp.apellido}</td>
                            <td>{emp.username}</td>
                            <td>{emp.nombre_rol || 'Empleado'}</td>
                            <td>
                                <button className="update-button" onClick={() => handleActionClick('editar', String(emp.id_usuario))}>
                                    <FontAwesomeIcon icon={faPen} /> Editar
                                </button>
                                &nbsp;
                                <button className="delete-button" onClick={() => handleActionClick('eliminar', String(emp.id_usuario))}>
                                    <FontAwesomeIcon icon={faTrash} /> Eliminar
                                </button>
                            </td>
                        </tr>
                    ))}
                    {empleados.length === 0 && (
                        <tr>
                            <td colSpan={6} style={{ textAlign: 'center' }}>No hay empleados registrados en este negocio.</td>
                        </tr>
                    )}
                </tbody>
            </table>

            {selectedAction && (
                <div ref={formRef}>
                    {selectedAction === 'crear' && (
                        <EmpleadoCreateForm onSuccess={handleSuccess} onCancel={handleCancel} />
                    )}
                    {selectedAction === 'editar' && (
                        <EmpleadoEditForm empleadoId={selectedEmpleadoId} onSuccess={handleSuccess} onCancel={handleCancel} />
                    )}
                    {selectedAction === 'eliminar' && (
                        <EmpleadoDeleteForm empleadoId={selectedEmpleadoId} onSuccess={handleSuccess} onCancel={handleCancel} />
                    )}
                </div>
            )}
        </div>
    );
};

export default AdminPanel;
