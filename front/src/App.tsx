import React from 'react';
import ProductCrud from './components/ProductCrud';
import Header from './components/Header';
import { Route, Routes } from "react-router-dom";

const App: React.FC = () => {
    return (
        <Routes>
            <Route
                path="/"
                element={
                    <div>
                        <Header />
                        <ProductCrud />
                    </div>
                }
            />
        </Routes>
    );
};

export default App;
