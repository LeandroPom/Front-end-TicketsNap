import React, { useState } from 'react';
import { useNavigate, Navigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { logoutUser } from '../../components/Redux/Actions/actions';
import { FaBars, FaTimes } from 'react-icons/fa';

const Header = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const user = useSelector((state) => state?.user);
  const [menuOpen, setMenuOpen] = useState(false);

  const handleLogout = () => {
    dispatch(logoutUser());
    navigate('/');
  };

  if (!user) return <Navigate to="/" />;

  return (
   <header
  className="fixed left-0 w-full backdrop-blur-md shadow-md border-b border-white/20"
  style={{
    top: '135px', // 50px (banner) + 85px (navbar) + 1px
    background: 'rgba(86, 86, 190, 0.4)',
    boxShadow: '0 4px 30px rgba(0, 0, 0, 0.1)',
    borderBottom: '1px solid rgba(255, 255, 255, 0.2)',
    backdropFilter: 'blur(10px)',
    WebkitBackdropFilter: 'blur(10px)',
    zIndex: 500,
  }}
>
      <div className="flex items-center justify-between px-4 md:px-8 py-3 text-white">
        {/* Logo / título */}
        <h2 className="text-lg md:text-xl font-bold">Panel de Administración</h2>

        {/* Botón hamburguesa (solo móvil) */}
        <div className="md:hidden">
          <button
            onClick={() => setMenuOpen(!menuOpen)}
            className="text-2xl focus:outline-none"
          >
            {menuOpen ? <FaTimes /> : <FaBars />}
          </button>
        </div>

        {/* Menú escritorio */}
        <nav className="hidden md:flex space-x-4">
          {user?.isAdmin && (
            <>
              <button onClick={() => navigate('/admin/dashboard')} className="px-3 py-1 rounded hover:bg-white/20">
                Métricas
              </button>
              <button onClick={() => navigate('/admin/events')} className="px-3 py-1 rounded hover:bg-white/20">
                Eventos
              </button>
              <button onClick={() => navigate('/admin/users')} className="px-3 py-1 rounded hover:bg-white/20">
                Usuarios
              </button>
              <button onClick={() => navigate('/admin/places')} className="px-3 py-1 rounded hover:bg-white/20">
                Lugares
              </button>
              <button onClick={() => navigate('/admin/tickets')} className="px-3 py-1 rounded hover:bg-white/20">
                Tickets Vendidos
              </button>
              <button onClick={() => navigate('/admin/banner')} className="px-3 py-1 rounded hover:bg-white/20">
                Banner
              </button>
            </>
          )}
          {user?.cashier && (
            <button onClick={() => navigate('/admin/tickets')} className="px-3 py-1 rounded hover:bg-white/20">
              Tickets Vendidos
            </button>
          )}
          <button onClick={handleLogout} className="px-3 py-1 rounded hover:bg-red-500">
            Salir
          </button>
        </nav>
      </div>

      {/* Menú móvil desplegable */}
      {menuOpen && (
        <div className="md:hidden bg-[rgba(86,86,190,0.85)] backdrop-blur-lg text-white flex flex-col space-y-2 px-4 py-4">
          {user?.isAdmin && (
            <>
              <button onClick={() => { navigate('/admin/dashboard'); setMenuOpen(false); }} className="hover:bg-white/20 px-3 py-1 rounded">
                Métricas
              </button>
              <button onClick={() => { navigate('/admin/events'); setMenuOpen(false); }} className="hover:bg-white/20 px-3 py-1 rounded">
                Eventos
              </button>
              <button onClick={() => { navigate('/admin/users'); setMenuOpen(false); }} className="hover:bg-white/20 px-3 py-1 rounded">
                Usuarios
              </button>
              <button onClick={() => { navigate('/admin/places'); setMenuOpen(false); }} className="hover:bg-white/20 px-3 py-1 rounded">
                Lugares
              </button>
              <button onClick={() => { navigate('/admin/tickets'); setMenuOpen(false); }} className="hover:bg-white/20 px-3 py-1 rounded">
                Tickets Vendidos
              </button>
              <button onClick={() => { navigate('/admin/banner'); setMenuOpen(false); }} className="hover:bg-white/20 px-3 py-1 rounded">
                Banner
              </button>
            </>
          )}
          {user?.cashier && (
            <button onClick={() => { navigate('/admin/tickets'); setMenuOpen(false); }} className="hover:bg-white/20 px-3 py-1 rounded">
              Tickets Vendidos
            </button>
          )}
          <button onClick={handleLogout} className="hover:bg-red-500 px-3 py-1 rounded">
            Salir
          </button>
        </div>
      )}
    </header>
  );
};

export default Header;
