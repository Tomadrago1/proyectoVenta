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

const App: React.FC = () => {
  return (
    <>
      <Routes>
        {/* Ruta pública */}
        <Route path="/" element={<Login />} />

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
      </Routes>
      <HelpButton />
    </>
  );
};

export default App;
