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
    navigate('/login');  // Redirige a la página de login después de hacer logout
  };

  return (
    <header className="admin-header">
      <div className="logo">
        <h2>Panel Administration</h2>
      </div>
      <nav>
        <ul>
          <li>
            <Link to="/admin/dashboard">Dashboard</Link>
          </li>
          <li>
            <Link to="/admin/events">Events</Link>
          </li>
          <li>
            <Link to="/admin/users">Users</Link>
          </li>
          <li>
            <Link to="/admin/places">Places</Link>
          </li>
          <li>
             <a href="/admin/tickets">Tickets Vendidos</a>
           </li>
          <li>
            <button className='botonedit' onClick={handleLogout}>Logout</button>
          </li>
        </ul>
      </nav>
    </header>
  );
};

export default Header;
