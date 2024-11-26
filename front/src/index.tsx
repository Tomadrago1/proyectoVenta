import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App'; // Importamos App.tsx

const rootElement = document.getElementById('root') as HTMLElement;

const root = ReactDOM.createRoot(rootElement);
root.render(
  <React.StrictMode>
    <App /> {/* Renderizamos el componente principal */}
  </React.StrictMode>
);
