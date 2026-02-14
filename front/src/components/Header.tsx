import React from 'react';
import { Link } from 'react-router-dom';
import '../styles/Header.css';

const Header = () => {
  return (
    <header className="header">
      <nav className="nav d-none d-lg-flex justify-content-center align-items-center">
        <ul>
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
        </ul>
      </nav>
    </header>
  );
};

export default Header;
