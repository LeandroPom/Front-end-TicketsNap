import React from 'react';
import { useNavigate, Navigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { logoutUser } from '../../components/Redux/Actions/actions';
import "../AdminPanel/Pages/estilospaneladm.css";

const Header = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const user = useSelector((state) => state?.user);  // Obtener el usuario desde Redux

  const handleLogout = () => {
    dispatch(logoutUser());
    navigate('/');  // Redirige a la página de login después de hacer logout
  };

  // Verificar si el usuario está cargado antes de acceder a sus propiedades
  if (!user) {
    return <Navigate to="/" />; // Si no hay usuario, redirige al login o página principal
  }

  return (
    <header className="admin-header">
      <div className="logo">
        <h2>Panel de Administración</h2>
      </div>
      <nav>
        <ul>
          {/* Verificamos el rol del usuario */}
          {user?.isAdmin ? (
            // Si es admin, mostramos todos los botones
            <>
              <button className="boton-barra-adm" onClick={() => window.location.href = '/admin/dashboard'}>
                Métricas
              </button>

              <button className="boton-barra-adm" onClick={() => window.location.href = '/admin/events'}>
                Eventos
              </button>

              <button className="boton-barra-adm" onClick={() => window.location.href = '/admin/users'}>
                Usuarios
              </button>

              <button className="boton-barra-adm" onClick={() => window.location.href = '/admin/places'}>
                Lugares
              </button>

              <button className="boton-barra-adm" onClick={() => window.location.href = '/admin/tickets'}>
                Tickets Vendidos
              </button>
            </>
          ) : user?.cashier ? (
            // Si es cashier, solo mostramos el botón de "Tickets Vendidos"
            <button className="boton-barra-adm" onClick={() => window.location.href = '/admin/tickets'}>
              Tickets Vendidos
            </button>
          ) : (
            // Si no es admin ni cashier, no mostramos nada
            <Navigate to="/" />
          )}

          {/* Botón de logout */}
          <button className='boton-barra-adm' onClick={() => navigate('/')}>
            Salir
          </button>
        </ul>
      </nav>
    </header>
  );
};

export default Header;
