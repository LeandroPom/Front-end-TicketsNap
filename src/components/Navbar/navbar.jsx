import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { logoutUser } from '../Redux/Actions/actions';
import { signOut } from 'firebase/auth';
import { auth } from '../Firebase/firebase.config';
import { useNavigate } from 'react-router-dom';
import { FaBars } from 'react-icons/fa';
import './navbar.css';

const Navbar = () => {
  const user = useSelector((state) => state.user); // Accedemos al usuario desde el estado global
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [dropdownOpen, setDropdownOpen] = useState(false); // Estado para el menú desplegable

  useEffect(() => {
    // Al cargar la página, verificar si hay un usuario en localStorage
    const savedUser = localStorage.getItem('user');
    if (savedUser) {
      dispatch({
        type: 'LOGIN_SUCCESS',
        payload: JSON.parse(savedUser),
      });
    }
  }, [dispatch]);

  const handleLogout = async () => {
    try {
      await signOut(auth); // Cerrar sesión en Firebase
      dispatch(logoutUser()); // Limpiar el estado global
      localStorage.removeItem('user'); // Eliminar el usuario del localStorage
      navigate('/login'); // Redirigir al login
    } catch (error) {
      console.error('Error al cerrar sesión', error);
    }
  };

  const handleCreateShow = () => {
    navigate('/create-show');
  };

  const toggleDropdown = () => {
    setDropdownOpen(!dropdownOpen); // Alternar estado del menú desplegable
  };

  return (
    <nav className="navbar">
      <div className="navbar-logo">
        <a href="/">Return Home</a>
      </div>
      <div className="navbar-links">
        {user && user.name && (
          <span className="user-name">
            {user.name}
          </span>
        )}
        <div className="dropdown">
          <FaBars className="dropdown-icon" onClick={toggleDropdown} />
          {dropdownOpen && (
            <div className="dropdown-menu">
              {user ? (
                <>
                  <a href="#" onClick={handleCreateShow} className="dropdown-item">
                    Create Show
                  </a>
                  <a href="#" onClick={handleLogout} className="dropdown-item">
                    Logout
                  </a>
                </>
              ) : (
                <>
                  <a href="/login" className="dropdown-item">Login</a>
                  <a href="/register" className="dropdown-item">Register</a>
                </>
              )}
            </div>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
