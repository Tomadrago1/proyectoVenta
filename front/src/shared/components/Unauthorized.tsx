import React from 'react';
import { useNavigate } from 'react-router-dom';

const Unauthorized: React.FC = () => {
    const navigate = useNavigate();

    return (
        <div style={{ padding: '2rem', textAlign: 'center', fontFamily: 'system-ui' }}>
            <h1>Acceso Denegado</h1>
            <p>No tienes los permisos necesarios para ver esta página.</p>
            <button 
                onClick={() => navigate(-1)} 
                style={{ padding: '10px 20px', backgroundColor: '#007bff', color: 'white', border: 'none', borderRadius: '5px', cursor: 'pointer', marginTop: '1rem' }}
            >
                Volver
            </button>
        </div>
    );
};

export default Unauthorized;
