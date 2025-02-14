import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { logoutUser } from '../Redux/Actions/actions';
import { signOut } from 'firebase/auth';
import { auth } from '../Firebase/firebase.config';
import { useNavigate } from 'react-router-dom';
import { FaBars, FaSun, FaMoon } from 'react-icons/fa'; // Importamos los íconos
import './navbar.css';
import SeatManager from '../ManagerSeat/seatmanager';
import { useTheme } from '../ThemeDark/themecontext'; // Importa el hook para el tema

const Navbar = () => {
  const user = useSelector((state) => state.user);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [isSeatManagerOpen, setIsSeatManagerOpen] = useState(false);
  const { isDarkMode, toggleTheme } = useTheme();

  

  useEffect(() => {
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
      await signOut(auth);
      dispatch(logoutUser());
      localStorage.removeItem('user');
      navigate('/login');
    } catch (error) {
      console.error('Error al cerrar sesión', error);
    }
  };

  const handleCreateShow = () => {
    navigate('/create-show');
  };

  const toggleDropdown = () => {
    setDropdownOpen(!dropdownOpen);
  };

  const handleOpenSeatManager = () => {
    setIsSeatManagerOpen(true);
  };

  const handleCloseSeatManager = () => {
    setIsSeatManagerOpen(false);
  };

  return (
    <nav className={`navbar ${isDarkMode ? 'dark' : 'light'}`}>
      <div className="navbar-logo">
        <a href="/">Ticket NAP</a>
         {/* Ícono compacto para cambiar el tema */}
         {isDarkMode ? (
          <FaSun
            onClick={toggleTheme}
            className="theme-toggle-icon"
          />
        ) : (
          <FaMoon
            onClick={toggleTheme}
            className="theme-toggle-icon"
          />
        )}
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
                  <a href="/admin/tickets" className="dropdown-item" style={{ display: user?.cashier ? 'block' : 'none' }}>
                    Tickets
                  </a>
                  {/* <a href="/createzone" className="dropdown-item">
                    CreateZone
                  </a> */}
                  <a href="/admin" className="dropdown-item" style={{ display: user?.isAdmin ? 'block' : 'none' }}>
                     Admin Panel
                  </a>
                  <a href="/profile" className="dropdown-item">
                    Profile
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

      {isSeatManagerOpen && (
        <div className="modal">
          <div className="modal-overlay" onClick={handleCloseSeatManager}></div>
          <div className="modal-content">
            <h2>Create Seats</h2>
            <SeatManager
              mapaUrl="/images/zona-floresta.png"
              onClose={handleCloseSeatManager}
            />
            <button className="close-modal-btn" onClick={handleCloseSeatManager}>
              Cerrar
            </button>
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
