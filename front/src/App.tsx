import React from 'react';
import { Route, Routes } from 'react-router-dom';

import Header from './shared/components/Header';
import HelpButton from './shared/components/HelpButton';
import Ayuda from './shared/components/Ayuda';
import Estadistica from './shared/components/Estadistica';

import Login from './features/auth/Login';
import ProtectedRoute from './features/auth/ProtectedRoute';

import Producto from './features/productos/Producto';
import VentaPage from './features/venta/Venta';
import Ventas from './features/ventas/Ventas';
import Categorias from './features/categoria/Categoria';

import AdminPanel from './features/admin/AdminPanel';
import SuperadminPanel from './features/superadmin/SuperadminPanel';
import Unauthorized from './shared/components/Unauthorized';

const App: React.FC = () => {
  return (
    <>
      <Routes>
        {/* Ruta pública */}
        <Route path="/" element={<Login />} />
        <Route path="/unauthorized" element={<Unauthorized />} />

        {/* Rutas protegidas — requieren JWT válido */}
        <Route
          path="/productos"
          element={
            <ProtectedRoute>
              <Header />
              <Producto />
            </ProtectedRoute>
          }
        />
        <Route
          path="/venta"
          element={
            <ProtectedRoute>
              <Header />
              <VentaPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/ventas"
          element={
            <ProtectedRoute>
              <Header />
              <Ventas />
            </ProtectedRoute>
          }
        />
        <Route
          path="/categorias"
          element={
            <ProtectedRoute>
              <Header />
              <Categorias />
            </ProtectedRoute>
          }
        />
        <Route
          path="/estadisticas"
          element={
            <ProtectedRoute>
              <Header />
              <Estadistica />
            </ProtectedRoute>
          }
        />
        <Route
          path="/ayuda"
          element={
            <ProtectedRoute>
              <Header />
              <Ayuda />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin"
          element={
            <ProtectedRoute requiredRoles={['Administrador', 'Superadmin']}>
              <Header />
              <AdminPanel />
            </ProtectedRoute>
          }
        />
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
