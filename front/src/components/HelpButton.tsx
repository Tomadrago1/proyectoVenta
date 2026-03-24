import React from 'react';
import { Link } from 'react-router-dom';
import '../styles/HelpButton.css';

const HelpButton: React.FC = () => {
    return (
        <Link to="/ayuda" className="help-floating-button" aria-label="Ir a Ayuda">
            Ayuda
        </Link>
    );
};

export default HelpButton;
