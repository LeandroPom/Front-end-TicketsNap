import React from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { logoutUser } from '../Redux/Actions/actions';
import { signOut } from 'firebase/auth';
import { auth } from '../Firebase/firebase.config';
import { useNavigate } from 'react-router-dom';
import './navbar.css';

const Navbar = () => {
  const user = useSelector((state) => state.user); // Accedemos al usuario desde el estado global
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      await signOut(auth); // Cerrar sesión en Firebase
      dispatch(logoutUser()); // Limpiar el estado global
      navigate('/login'); // Redirigir al login
    } catch (error) {
      console.error('Error al cerrar sesión', error);
    }
  };

  return (
    <nav className="navbar">
      <div className="navbar-logo">
        <a href="/">Return Home</a>
      </div>
      <div className="navbar-links">
        {user ? (
          <div className="user-info">
            <span>{user.name}</span>
            <button onClick={handleLogout} className="btn logout-btn">
              Logout
            </button>
          </div>
        ) : (
          <>
            <a href="/login" className="btn login-btn">Login</a>
            <a href="/register" className="btn register-btn">Register</a>
          </>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
