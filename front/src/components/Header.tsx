import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import "../styles/Header.css";


const Header = () => {
    const navigate = useNavigate();

    return (
        <header className="header">
            <nav className="nav d-none d-lg-flex justify-content-center align-items-center">
                <ul>
                    <li><Link to="/productos">Productos</Link></li>
                    <li><Link to="/ventas">Ventas</Link></li>
                </ul>
            </nav>
        </header>
    );
};

export default Header;
