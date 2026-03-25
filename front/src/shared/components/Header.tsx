import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../features/auth/useAuth';
import './Header.css';

const Header = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const isSuperadmin = user?.nombre_rol === 'Superadmin';
  const isAdmin = user?.nombre_rol === 'Administrador';

  return (
    <header className="header">
      <nav className="nav d-none d-lg-flex justify-content-center align-items-center">
        <ul>
          {isSuperadmin ? (
            <li>
              <Link to="/superadmin">Panel Superadmin</Link>
            </li>
          ) : (
            <>
              <li>
                <Link to="/venta">Venta</Link>
              </li>
              <li>
                <Link to="/productos">Productos</Link>
              </li>
              <li>
                <Link to="/categorias">Categorias</Link>
              </li>
              <li>
                <Link to="/ventas">Ventas</Link>
              </li>
              <li>
                <Link to="/estadisticas">Estadisticas</Link>
              </li>
              {isAdmin && (
                <li>
                  <Link to="/admin">Panel Admin</Link>
                </li>
              )}
            </>
          )}
          <li>
            <button className="logout-button" onClick={handleLogout} style={{ background: 'transparent', border: 'none', color: 'white', cursor: 'pointer', fontWeight: 'bold' }}>Salir</button>
          </li>
        </ul>
      </nav>
    </header>
  );
};

export default Header;
