import React from 'react';
import ProductCrud from './components/productos/Producto';
import { Route, Routes } from 'react-router-dom';

import Header from './components/Header';
import HelpButton from './components/HelpButton';
import Login from './components/Login';
import Venta from './components/Venta';
import Ventas from './components/Ventas';
import Producto from './components/productos/Producto';
import Categoria from './components/Categoria';
import Estadistica from './components/Estadistica';
import Ayuda from './components/Ayuda';
import ProtectedRoute from './components/ProtectedRoute';

const App: React.FC = () => {
  return (
    <>
      <Routes>
        {/* Ruta pública */}
        <Route
          path="/"
          element={
            <div>
              <Login />
            </div>
          }
        />

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
              <Venta />
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
              <Categoria />
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
