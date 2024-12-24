import React from 'react';
import ProductCrud from './components/Producto';
import { Route, Routes } from 'react-router-dom';

import Header from './components/Header';
import Login from './components/Login';
import Venta from './components/Venta';
import Ventas from './components/Ventas';
import Producto from './components/Producto';
import Categoria from './components/Categoria';
import Estadistica from './components/Estadistica';

const App: React.FC = () => {
  return (
    <Routes>
      <Route
        path="/"
        element={
          <div>
            <Login />
          </div>
        }
      />
      <Route
        path="/productos"
        element={
          <div>
            <Header />
            <Producto />
          </div>
        }
      />
      <Route
        path="/venta"
        element={
          <div>
            <Header />
            <Venta />
          </div>
        }
      />
      <Route
        path="/ventas"
        element={
          <div>
            <Header />
            <Ventas />
          </div>
        }
      />
      <Route
        path="/categorias"
        element={
          <div>
            <Header />
            <Categoria />
          </div>
        }
      />
      <Route
        path="/estadisticas"
        element={
          <div>
            <Header />
            <Estadistica />
          </div>
        }
      />
    </Routes>
  );
};

export default App;
