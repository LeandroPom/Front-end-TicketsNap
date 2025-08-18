import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { logoutUser } from '../Redux/Actions/actions';
import { signOut } from 'firebase/auth';
import { auth } from '../Firebase/firebase.config';
import { useNavigate } from 'react-router-dom';
import { FaBars, FaSun, FaMoon } from 'react-icons/fa';
import SeatManager from '../ManagerSeat/seatmanager';
import { useTheme } from '../ThemeDark/themecontext';

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
      dispatch({ type: 'LOGIN_SUCCESS', payload: JSON.parse(savedUser) });
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

  return (
    <>
 {/* Banner fijo arriba */}
<div
  className="fixed top-0 left-0 w-full z-[900] bg-white overflow-hidden"
  style={{ height: '50px' }}
>
  <img
    src="/images/cabezadepaginasolticket.png"
    alt="Cabeza de página"
    className="w-full h-full object-fill"
  />
</div>

{/* Navbar justo debajo del banner */}
<nav
  className={`fixed top-[50px] left-0 w-full flex justify-center z-[1000] backdrop-blur-md shadow-md border-b border-white/20
    ${isDarkMode ? 'bg-gray-800/60 text-white' : 'bg-blue-500/40 text-white'}`}
  style={{
    height: '90px',
    background: 'rgba(86, 86, 190, 0.4)', // semi-transparente con color
    boxShadow: '0 4px 30px rgba(0, 0, 0, 0.1)',
    borderBottom: '1px solid rgba(255, 255, 255, 0.2)',
    backdropFilter: 'blur(10px)',
    WebkitBackdropFilter: 'blur(10px)',
  }}
>
  <div className="w-full flex items-center justify-between px-5 h-full">
    {/* Logo pequeño + toggle en flex */}
    <div className="w-full flex items-center justify-center relative h-full">
      <a href="/" className="cursor-pointer">
        <img
          src="/images/solticket.png"
          alt="Sol Ticket"
          className="w-[200px] h-auto max-h-[120px] object-contain"
        />
      </a>
          </div>

          {/* Usuario y Dropdown */}
          <div className="relative font-bold text-[0.9rem] flex items-center space-x-4">
            {user?.name && (
              <a
                href="/profile"
                className="text-sm font-bold truncate max-w-[150px] cursor-pointer"
                title={user.email}
              >
                {user.email}
              </a>
            )}
            <FaBars
              onClick={() => setDropdownOpen(!dropdownOpen)}
              className="cursor-pointer text-gray-500 text-2xl hover:text-gray-700 transition-colors duration-300"
              title="Abrir menú"
            />
            {dropdownOpen && (
  <div
    className="absolute right-0 top-full mt-2 w-48 rounded shadow-lg flex flex-col p-4 space-y-2 z-50 text-black font-bold"
    style={{
      background: 'rgba(86, 86, 190, 0.93)',
      backdropFilter: 'blur(10px)',
      WebkitBackdropFilter: 'blur(10px)',
      border: '1px solid rgba(255, 255, 255, 0.52)',
      boxShadow: '0 4px 30px rgba(0, 0, 0, 0.1)',
    }}
  >
    {user ? (
      <>
        {user.cashier && (
          <a href="/admin/tickets" className="hover:bg-blue-400/30 px-2 py-1 rounded cursor-pointer">
            Tickets
          </a>
        )}
        {user.isAdmin && (
          <a href="/admin" className="hover:bg-blue-400/30 px-2 py-1 rounded cursor-pointer">
            Panel de admin
          </a>
        )}
        <a href="/profile" className="hover:bg-blue-400/30 px-2 py-1 rounded cursor-pointer">
          Mi perfil
        </a>
        <button
          onClick={handleLogout}
          className="hover:bg-blue-500 hover:text-white px-2 py-1 rounded cursor-pointer text-left"
        >
          Salir
        </button>
      </>
    ) : (
      <>
        <a href="/login" className="hover:bg-blue-400/30 px-2 py-1 rounded cursor-pointer">
          Entrar
        </a>
        <a href="/register" className="hover:bg-blue-400/30 px-2 py-1 rounded cursor-pointer">
          Registrarse
        </a>
      </>
    )}
  </div>
)}
          </div>
        </div>
      </nav>

      {/* Modal SeatManager */}
      {isSeatManagerOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg max-w-lg w-full relative">
            <button
              onClick={() => setIsSeatManagerOpen(false)}
              className="absolute top-3 right-3 text-red-600 hover:text-red-800 font-bold"
              aria-label="Cerrar modal"
            >
              X
            </button>
            <SeatManager />
          </div>
        </div>
      )}
    </>
  );
};

export default Navbar;
