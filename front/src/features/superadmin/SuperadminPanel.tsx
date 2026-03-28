import React, { useState, useRef } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPlus, faPen, faTrash, faBuilding, faUserTie } from '@fortawesome/free-solid-svg-icons';
import { useNegocios } from './useNegocios';
import NegocioCreateForm from './NegocioCreateForm';
import NegocioEditForm from './NegocioEditForm';
import NegocioDeleteForm from './NegocioDeleteForm';
import NegocioAddAdminForm from './NegocioAddAdminForm';
import './SuperadminPanel.css';

type Tab = 'negocios';

const TABS: { id: Tab; label: string; icon: any }[] = [
    { id: 'negocios', label: 'Negocios', icon: faBuilding },
];

const SuperadminPanel: React.FC = () => {
    const { negocios, loading, error, fetchNegocios } = useNegocios();
    const [activeTab, setActiveTab] = useState<Tab>('negocios');
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

    return (
        <div className="superadmin-dashboard">
            {/* Sidebar */}
            <aside className="superadmin-sidebar">
                <div className="superadmin-sidebar-header">
                    <h2>Panel Superadmin</h2>
                </div>
                <nav className="superadmin-sidebar-nav">
                    {TABS.map((tab) => (
                        <button
                            key={tab.id}
                            className={`superadmin-nav-item ${activeTab === tab.id ? 'active' : ''}`}
                            onClick={() => {
                                setActiveTab(tab.id);
                                setSelectedAction('');
                            }}
                        >
                            <FontAwesomeIcon icon={tab.icon} className="superadmin-nav-icon" />
                            <span>{tab.label}</span>
                        </button>
                    ))}
                </nav>
            </aside>

            {/* Contenido principal */}
            <main className="superadmin-main">
                {activeTab === 'negocios' && (
                    <div className="superadmin-content-section">
                        <div className="superadmin-section-header">
                            <div>
                                <h1>Gestión de Negocios</h1>
                                <p className="superadmin-section-subtitle">Administrá los negocios registrados en la plataforma</p>
                            </div>
                            <button className="superadmin-btn-primary" onClick={() => handleActionClick('crear')}>
                                <FontAwesomeIcon icon={faPlus} /> Nuevo Negocio
                            </button>
                        </div>

                        {loading && <div className="superadmin-loading">Cargando negocios...</div>}
                        {error && <div className="superadmin-error">Error: {error}</div>}

                        {!loading && !error && (
                            <div className="superadmin-table-wrapper">
                                <table className="superadmin-table">
                                    <thead>
                                        <tr>
                                            <th>#</th>
                                            <th>Nombre del Negocio</th>
                                            <th>Ciudad</th>
                                            <th>Teléfono</th>
                                            <th>Fecha Registro</th>
                                            <th>Acciones</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {negocios.map(neg => (
                                            <tr key={neg.id_negocio}>
                                                <td><span className="superadmin-badge">{neg.id_negocio}</span></td>
                                                <td>{neg.nombre_negocio}</td>
                                                <td>{neg.ciudad || '-'}</td>
                                                <td>{neg.telefono || '-'}</td>
                                                <td><code className="superadmin-code">{new Date(neg.fecha_registro || Date.now()).toLocaleDateString()}</code></td>
                                                <td className="superadmin-actions-cell">
                                                    <button
                                                        className="superadmin-btn-icon"
                                                        style={{ background: '#d1fae5', color: '#059669', border: '1px solid #10b981' }}
                                                        onClick={() => handleActionClick('personal', String(neg.id_negocio))}
                                                        title="Personal"
                                                    >
                                                        <FontAwesomeIcon icon={faUserTie} />
                                                    </button>
                                                    <button
                                                        className="superadmin-btn-icon edit"
                                                        onClick={() => handleActionClick('editar', String(neg.id_negocio))}
                                                        title="Editar"
                                                    >
                                                        <FontAwesomeIcon icon={faPen} />
                                                    </button>
                                                    <button
                                                        className="superadmin-btn-icon delete"
                                                        onClick={() => handleActionClick('eliminar', String(neg.id_negocio))}
                                                        title="Eliminar"
                                                    >
                                                        <FontAwesomeIcon icon={faTrash} />
                                                    </button>
                                                </td>
                                            </tr>
                                        ))}
                                        {negocios.length === 0 && (
                                            <tr>
                                                <td colSpan={6} className="superadmin-empty-row">No hay negocios registrados en el sistema.</td>
                                            </tr>
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        )}

                        {selectedAction && (
                            <div ref={formRef} className="superadmin-form-panel">
                                {selectedAction === 'crear' && (
                                    <NegocioCreateForm onSuccess={handleSuccess} onCancel={handleCancel} />
                                )}
                                {selectedAction === 'editar' && (
                                    <NegocioEditForm negocioId={selectedNegocioId} onSuccess={handleSuccess} onCancel={handleCancel} />
                                )}
                                {selectedAction === 'eliminar' && (
                                    <NegocioDeleteForm negocioId={selectedNegocioId} onSuccess={handleSuccess} onCancel={handleCancel} />
                                )}
                                {selectedAction === 'personal' && (
                                    <NegocioAddAdminForm negocioId={selectedNegocioId} onSuccess={handleSuccess} onCancel={handleCancel} />
                                )}
                            </div>
                        )}
                    </div>
                )}
            </main>
        </div>
    );
};

export default SuperadminPanel;

