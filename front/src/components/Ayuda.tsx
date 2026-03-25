import React from 'react';
import api from '../config/api';
import { API_URL } from '../config/api';

const Ayuda: React.FC = () => {

    const handleTestImpresion = () => {
        api.post(`${API_URL}/impresora/test-imprimir`, {
        })
            .then(response => {
                alert(response.data.message);
            })
            .catch(error => {
                console.error('Error al realizar la prueba de impresión:', error);
                alert(`Error al realizar la prueba de impresión. ${error.response?.data?.error}`);
            });
    };

    return (
        <div style={{ maxWidth: '900px', margin: '40px auto', padding: '0 20px' }}>
            <h1>Centro de Ayuda</h1>
            <p>
                Esta seccion sera usada para guiar la configuracion de la impresora.
            </p>
            <p>
                En el siguiente paso podemos agregar un asistente con pasos, deteccion de
                modelo y prueba de impresion.
            </p>
            <button onClick={handleTestImpresion}>Test impresion</button>
        </div>
    );
};

export default Ayuda;
