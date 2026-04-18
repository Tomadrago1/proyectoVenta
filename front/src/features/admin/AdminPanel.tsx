import React, { useState, useRef } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faPlus, faPen, faTrash,
  faUsers, faBoxOpen, faTag, faChartLine, faReceipt, faBarcode, faPrint
} from '@fortawesome/free-solid-svg-icons';
import { useEmpleados } from './useEmpleados';
import EmpleadoCreateForm from './EmpleadoCreateForm';
import EmpleadoEditForm from './EmpleadoEditForm';
import EmpleadoDeleteForm from './EmpleadoDeleteForm';
import Producto from '../productos/Producto';
import Categorias from '../categoria/Categoria';
import Ventas from '../ventas/Ventas';
import Estadistica from '../../shared/components/Estadistica';
import BarcodeConfigPanel from '../barcode/BarcodeConfigPanel';
import PrinterConfigPanel from '../printer/PrinterConfigPanel';
import './AdminPanel.css';

type Tab = 'empleados' | 'productos' | 'categorias' | 'estadisticas' | 'ventas' | 'balanza' | 'impresora';

const TABS: { id: Tab; label: string; icon: any }[] = [
  { id: 'empleados',    label: 'Empleados',    icon: faUsers      },
  { id: 'productos',    label: 'Productos',    icon: faBoxOpen    },
  { id: 'categorias',   label: 'Categorías',   icon: faTag        },
  { id: 'ventas',       label: 'Ventas',       icon: faReceipt    },
  { id: 'estadisticas', label: 'Estadísticas', icon: faChartLine  },
  { id: 'balanza',      label: 'Balanza',      icon: faBarcode    },
  { id: 'impresora',    label: 'Impresora',    icon: faPrint      },
];

const AdminPanel: React.FC = () => {
  const [activeTab, setActiveTab] = useState<Tab>('empleados');
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

  return (
    <div className="admin-dashboard">
      {/* Sidebar */}
      <aside className="admin-sidebar">
        <div className="admin-sidebar-header">
          <span className="admin-sidebar-logo">⚙️</span>
          <h2>Panel Admin</h2>
        </div>
        <nav className="admin-sidebar-nav">
          {TABS.map((tab) => (
            <button
              key={tab.id}
              className={`admin-nav-item ${activeTab === tab.id ? 'active' : ''}`}
              onClick={() => {
                setActiveTab(tab.id);
                setSelectedAction('');
              }}
            >
              <FontAwesomeIcon icon={tab.icon} className="admin-nav-icon" />
              <span>{tab.label}</span>
            </button>
          ))}
        </nav>
      </aside>

      {/* Contenido principal */}
      <main className="admin-main">
        {/* TAB: EMPLEADOS */}
        {activeTab === 'empleados' && (
          <div className="admin-content-section">
            <div className="admin-section-header">
              <div>
                <h1>Gestión de Empleados</h1>
                <p className="admin-section-subtitle">Administrá los usuarios de tu negocio</p>
              </div>
              <button className="admin-btn-primary" onClick={() => handleActionClick('crear')}>
                <FontAwesomeIcon icon={faPlus} /> Nuevo Empleado
              </button>
            </div>

            {loading && <div className="admin-loading">Cargando empleados...</div>}
            {error && <div className="admin-error">Error: {error}</div>}

            {!loading && !error && (
              <div className="admin-table-wrapper">
                <table className="admin-table">
                  <thead>
                    <tr>
                      <th>#</th>
                      <th>Nombre</th>
                      <th>Apellido</th>
                      <th>Username</th>
                      <th>Rol</th>
                      <th>Acciones</th>
                    </tr>
                  </thead>
                  <tbody>
                    {empleados.map((emp) => (
                      <tr key={emp.id_usuario}>
                        <td><span className="admin-badge">{emp.id_usuario}</span></td>
                        <td>{emp.nombre}</td>
                        <td>{emp.apellido}</td>
                        <td><code className="admin-code">{emp.username}</code></td>
                        <td><span className="admin-role-chip">{emp.nombre_rol || 'Empleado'}</span></td>
                        <td className="admin-actions-cell">
                          <button
                            className="admin-btn-icon edit"
                            onClick={() => handleActionClick('editar', String(emp.id_usuario))}
                            title="Editar"
                          >
                            <FontAwesomeIcon icon={faPen} />
                          </button>
                          <button
                            className="admin-btn-icon delete"
                            onClick={() => handleActionClick('eliminar', String(emp.id_usuario))}
                            title="Eliminar"
                          >
                            <FontAwesomeIcon icon={faTrash} />
                          </button>
                        </td>
                      </tr>
                    ))}
                    {empleados.length === 0 && (
                      <tr>
                        <td colSpan={6} className="admin-empty-row">
                          No hay empleados registrados en este negocio.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            )}

            {selectedAction && (
              <div ref={formRef} className="admin-form-panel">
                {selectedAction === 'crear' && (
                  <EmpleadoCreateForm onSuccess={handleSuccess} onCancel={handleCancel} />
                )}
                {selectedAction === 'editar' && (
                  <EmpleadoEditForm
                    empleadoId={selectedEmpleadoId}
                    onSuccess={handleSuccess}
                    onCancel={handleCancel}
                  />
                )}
                {selectedAction === 'eliminar' && (
                  <EmpleadoDeleteForm
                    empleadoId={selectedEmpleadoId}
                    onSuccess={handleSuccess}
                    onCancel={handleCancel}
                  />
                )}
              </div>
            )}
          </div>
        )}

        {/* TAB: PRODUCTOS */}
        {activeTab === 'productos' && (
          <div className="admin-content-section">
            <div className="admin-section-header">
              <div>
                <h1>Gestión de Productos</h1>
                <p className="admin-section-subtitle">Controlá el catálogo de tu negocio</p>
              </div>
            </div>
            <Producto />
          </div>
        )}

        {/* TAB: CATEGORÍAS */}
        {activeTab === 'categorias' && (
          <div className="admin-content-section">
            <div className="admin-section-header">
              <div>
                <h1>Gestión de Categorías</h1>
                <p className="admin-section-subtitle">Organizá tus productos por categoría</p>
              </div>
            </div>
            <Categorias />
          </div>
        )}

        {/* TAB: VENTAS */}
        {activeTab === 'ventas' && (
          <div className="admin-content-section">
            <div className="admin-section-header">
              <div>
                <h1>Gestión de Ventas</h1>
                <p className="admin-section-subtitle">Historial de ventas realizadas</p>
              </div>
            </div>
            <Ventas />
          </div>
        )}

        {/* TAB: ESTADÍSTICAS */}
        {activeTab === 'estadisticas' && (
          <div className="admin-content-section">
            <div className="admin-section-header">
              <div>
                <h1>Estadísticas</h1>
                <p className="admin-section-subtitle">Métricas y rendimiento del negocio</p>
              </div>
            </div>
            <Estadistica />
          </div>
        )}

        {/* TAB: BALANZA */}
        {activeTab === 'balanza' && (
          <div className="admin-content-section">
            <BarcodeConfigPanel />
          </div>
        )}

        {/* TAB: IMPRESORA */}
        {activeTab === 'impresora' && (
          <div className="admin-content-section">
            <PrinterConfigPanel />
          </div>
        )}
      </main>
    </div>
  );
};

export default AdminPanel;
