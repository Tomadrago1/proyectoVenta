import React from 'react';
import ProductCrud from './components/Producto';
import { Route, Routes } from "react-router-dom";

import Header from './components/Header';
import Login from './components/Login';
import Venta from './components/Venta';
import Ventas from './components/Ventas';
import Producto from './components/Producto'

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
        </Routes>
    );
};

export default App;
