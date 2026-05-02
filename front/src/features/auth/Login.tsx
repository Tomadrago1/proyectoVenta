import React, { useState } from 'react';
import api from '../../shared/api/api';
import { useNavigate } from 'react-router-dom';
import './Login.css';

const Login: React.FC = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  async function handleLogin(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    try {
      const response = await api.post('/usuario/login', {
        username,
        password,
      });
      if (response.status === 200) {
        switch (response.data.id_rol) {
          case 1:
            navigate('/admin');
            break;
          case 2:
            navigate('/venta');
            break;
          case 3:
            navigate('/superadmin');
            break;
        }
      }
    } catch (error: any) {
      if (error?.response) {
        if (error.response.status === 401) {
          setError('Usuario o contraseña incorrectos.');
        } else {
          setError('Error en el servidor, intente nuevamente.');
        }
      } else if (error?.request) {
        setError('Error al conectar al servidor, intente nuevamente.');
      } else {
        setError('Error desconocido, intente nuevamente.');
      }

      console.error('Error en login:', error?.response ? error.response.data : error?.message || error);
    }
  }

  return (
    <div className="container-session">
      <div className="form-session">
        <h2>Inicio de Sesión</h2>
        <form onSubmit={handleLogin} className='form-acomodar'>
          <div className='container-inputs'>
            <label>Nombre de Usuario:</label>
            <input
              type="text"
              name="username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
            />
          </div>
          <div className='container-inputs'>
            <label>Contraseña:</label>
            <input
              type="password"
              name="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>
          {error && <p className="error-message">{error}</p>}
          <div className="container-button">
            <button type="submit">Ingresar</button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Login;
