import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { logoutUser } from '../../components/Redux/Actions/actions';
import "../AdminPanel/Pages/estilospaneladm.css";

const Header = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const handleLogout = () => {
    dispatch(logoutUser());
    navigate('/login');  // Redirige a la página de login después de hacer logout
  };

  return (
    <header className="admin-header">
      <div className="logo">
        <h2>Panel de Administración</h2>
      </div>
      <nav>
        <ul>
          <li>
            <Link to="/admin/dashboard">Dashboard</Link>
          </li>
          <li>
            <Link to="/admin/events">Eventos</Link>
          </li>
          <li>
            <Link to="/admin/users">Usuarios</Link>
          </li>
          <li>
            <Link to="/admin/places">Lugares</Link>
          </li>
          <li>
            <button onClick={handleLogout}>Cerrar sesión</button>
          </li>
        </ul>
      </nav>
    </header>
  );
};

export default Header;
