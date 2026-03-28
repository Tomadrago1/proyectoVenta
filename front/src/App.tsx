import React from 'react';
import { Route, Routes } from 'react-router-dom';

import Header from './shared/components/Header';
import HelpButton from './shared/components/HelpButton';
import Ayuda from './shared/components/Ayuda';

import Login from './features/auth/Login';
import ProtectedRoute from './features/auth/ProtectedRoute';

import Producto from './features/productos/Producto';
import VentaPage from './features/venta/Venta';
import Ventas from './features/ventas/Ventas';
import Categorias from './features/categoria/Categoria';

import AdminPanel from './features/admin/AdminPanel';
import SuperadminPanel from './features/superadmin/SuperadminPanel';
import Unauthorized from './shared/components/Unauthorized';

const EMPLEADO_ROLES = ['Administrador', 'Empleado'];

const App: React.FC = () => {
  return (
    <>
      <Routes>
        {/* Ruta pública */}
        <Route path="/" element={<Login />} />
        <Route path="/unauthorized" element={<Unauthorized />} />

        {/* Rutas de empleado y administrador — Superadmin no accede */}
        <Route
          path="/productos"
          element={
            <ProtectedRoute requiredRoles={EMPLEADO_ROLES}>
              <Header />
              <Producto />
            </ProtectedRoute>
          }
        />
        <Route
          path="/venta"
          element={
            <ProtectedRoute requiredRoles={EMPLEADO_ROLES}>
              <Header />
              <VentaPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/ventas"
          element={
            <ProtectedRoute requiredRoles={EMPLEADO_ROLES}>
              <Header />
              <Ventas />
            </ProtectedRoute>
          }
        />
        <Route
          path="/categorias"
          element={
            <ProtectedRoute requiredRoles={EMPLEADO_ROLES}>
              <Header />
              <Categorias />
            </ProtectedRoute>
          }
        />
        <Route
          path="/ayuda"
          element={
            <ProtectedRoute requiredRoles={EMPLEADO_ROLES}>
              <Header />
              <Ayuda />
            </ProtectedRoute>
          }
        />

        {/* Panel Admin — solo Administrador (incluye productos, categorías y estadísticas) */}
        <Route
          path="/admin"
          element={
            <ProtectedRoute requiredRoles={['Administrador']}>
              <Header />
              <AdminPanel />
            </ProtectedRoute>
          }
        />

        {/* Panel Superadmin — solo Superadmin */}
        <Route
          path="/superadmin"
          element={
            <ProtectedRoute requiredRoles={['Superadmin']}>
              <Header />
              <SuperadminPanel />
            </ProtectedRoute>
          }
        />
      </Routes>
      <HelpButton />
    </>
  );
};

export default App;
