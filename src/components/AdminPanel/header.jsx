import React  from 'react';
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
        <h2>Panel de Administración</h2>
      </div>
      <nav>
        <ul>
          {user?.isAdmin && (
            <>
              
              <button className="boton-barra-adm" onClick={() => window.location.href = '/admin/dashboard'}>
              Metricas
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
             
            </>
          )}

          {/* Tanto admin como cashier pueden acceder a Tickets Vendidos */}
          
          <button className="boton-barra-adm" onClick={() => window.location.href = '/admin/tickets'}>
          Tickets Vendidos
          </button>

          
            <button className='boton-barra-adm' onClick={handleLogout}>Salir</button>
         
        </ul>
      </nav>
    </header>
  );
};

export default Header;
