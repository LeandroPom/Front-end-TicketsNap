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
       <img
      src="/images/cabezadepaginasolticket.png"
      alt="Sol Ticket"
      style={{
        position: 'absolute',
        top: '-31px', // O ajusta la posición según sea necesario
        left: '50%',
        transform: 'translateX(-50%)', // Centra la imagen
        zIndex: '1001', // Asegura que la imagen esté por encima de otros elementos
        width: '1400px',
        height: '40px',
        margin: "1px",
      }}
    />
  <div className="navbar-logo">
    <a href="/">
    <img src="/images/solticket.png" alt="Sol Ticket" style={{ width: '180px', height: '70px' }} />
    </a>
    
    {/* Ícono compacto para cambiar el tema */}
         {isDarkMode ? (
          <FaMoon
            onClick={toggleTheme}
            className="theme-toggle-icon"
          />
        ) : (
          <FaSun
            onClick={toggleTheme}
            className="theme-toggle-icon"
          />
        )}
      </div>
          
          
        {user && user.name && (
          <a href='/profile'>
            <span className="user-name">
              {user.name}
            </span>
          </a>
        )}
          
      <div className="navbar-links">
        <div className="dropdown">
         <p>
          
         </p>
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
                    Panel de admin
                  </a>
                  <a href="/profile" className="dropdown-item">
                    Mi perfil
                  </a>
                  <a href="#" onClick={handleLogout} className="dropdown-item">
                    Salir
                  </a>
                </>
              ) : (
                <>
                  <a href="/login" className="dropdown-item">Entrar</a>
                  <a href="/register" className="dropdown-item">Registrarse</a>
                 
                </>
              )}
            </div>
          )}
        </div>
      </div>

      {isSeatManagerOpen && (
        <div className="modal">
          <div className="modal-overlay" onClick={handleCloseSeatManager}></div>
         
        </div>
      )}
    </nav>
  );
};

export default Navbar;