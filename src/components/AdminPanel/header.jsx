import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { logoutUser } from '../../components/Redux/Actions/actions';
import "../AdminPanel/Pages/estilospaneladm.css";

const Header = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const user = useSelector((state) => state.user);

  const handleLogout = () => {
    dispatch(logoutUser());
    navigate('/');  // Redirige a la página de login después de hacer logout
  };

  return (
    <header className="admin-header">
      <div className="logo">
        <h2>Panel Administration</h2>
      </div>
      <nav>
        <ul>
          {user?.isAdmin && (
            <>
              <li >
                <Link to="/admin/dashboard">Metricas</Link>
              </li>
              <li>
                <Link to="/admin/events">Eventos</Link>
              </li>
              <li>
                <Link to="/admin/users">Usuarios</Link>
              </li>
              <li>
                <Link to="/admin/places">Lugar</Link>
              </li>
            </>
          )}

          {/* Tanto admin como cashier pueden acceder a Tickets Vendidos */}
          <li>
            <Link to="/admin/tickets">Tickets Vendidos</Link>
          </li>

          <li>
            <button className='botonedit' onClick={handleLogout}>Salir</button>
          </li>
        </ul>
      </nav>
    </header>
  );
};

export default Header;
