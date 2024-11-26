import React from 'react';
import { Link } from 'react-router-dom';
import './navbar.css'; // Asegúrate de que la ruta al archivo CSS sea correcta

const Navbar = () => {
  return (
    <nav className="navbar">
      <div className="navbar-logo">
        <Link to="/">Return Home</Link> {/* Cambia el texto según tu preferencia */}
      </div>
      <div className="navbar-links">
        <Link to="/login" className="btn login-btn">Login</Link>
        <Link to="/register" className="btn register-btn">Register</Link>
      </div>
    </nav>
  );
};

export default Navbar;
