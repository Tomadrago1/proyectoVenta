import React, { useState } from 'react';
import axios from 'axios';
import { Link, useNavigate } from 'react-router-dom';
import '../styles/Login.css';

const Login: React.FC = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  async function handleLogin(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();  
    try {
      const response = await axios.post('/api/cliente/login', { username, password });
      console.log(response);

      if (response.status === 200) {
        const { cliente, token } = response.data;

        if (cliente.estado === 1) {
          console.log('Login successful:', cliente);
          setError('');

          localStorage.setItem('token', token);
          localStorage.setItem('user', JSON.stringify(cliente));

          if (cliente.tipo_usuario === 'admin') {
            navigate('/vistaAdmin', { state: { cliente } });
          } else {
            navigate('/', { state: { cliente } });
          }
        } else {
          setError('La cuenta ha sido deshabilitada.');
        }
      } else {
        setError('Usuario o contraseña incorrectos.');
      }
    } catch (error) {
      console.error('Login failed:', error);
      setError('Error al iniciar sesión, por favor intente nuevamente.');
    }
  }

  return (
    <div className='container-session'>
      <div className='form-session'>
        <h2>Login</h2>
        <form onSubmit={handleLogin}>
          <div>
            <label>Username:</label>
            <input
              type="text"
              name="username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
            />
          </div>
          <div>
            <label>Password:</label>
            <input
              type="password"
              name="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>
          {error && <p className="error-message">{error}</p>}
          <div className='container-button'>
            <button type="submit">Login</button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Login;