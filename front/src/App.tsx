import React from 'react';
import ProductCrud from './components/ProductCrud';
import { Route, Routes } from "react-router-dom";

import Header from './components/Header';
import Login from './components/Login';
import Venta from './components/Venta';

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
                        <ProductCrud />
                    </div>
                }
            />
            <Route
                path="/ventas"
                element={
                    <div>
                        <Header />
                        <Venta />
                    </div>
                }
            />
        </Routes>
    );
};

export default App;
