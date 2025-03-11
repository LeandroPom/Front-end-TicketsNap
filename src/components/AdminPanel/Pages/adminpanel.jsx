import React, { useEffect, useState } from 'react';
import { Routes, Route, useNavigate, Navigate } from 'react-router-dom';
import Header from '../header';
import Dashboard from './dashboard';
import Events from './events';
import Places from './places';
import UsersManagement from './users';
import SoldTickets from './SoldTickets';
import Swal from 'sweetalert2';
import { useSelector } from 'react-redux';
import './estilospaneladm.css';

const AdminPanel = () => {
  const user = useSelector((state) => state.user); // Obtener el usuario desde Redux
  const [loading, setLoading] = useState(true); // Estado de carga
  const [error, setError] = useState(null); // Estado de error (si lo necesitas)
  const navigate = useNavigate();

  useEffect(() => {
    if (user === null) {
      // Si el usuario no está en Redux, continúa en estado de carga
      setLoading(true);
    } else {
      // Una vez que el usuario esté cargado, verifica si es admin
      if (!user.isAdmin) {
        Swal.fire({
          title: 'Acceso Denegado',
          text: 'No tienes permisos para acceder a este panel.',
          icon: 'error',
        });
        setError('Acceso Denegado'); // Opcional: puedes manejar el error
        navigate("/")
      } else {
        setLoading(false); // Si el usuario es admin, termina el loading
      }
      
    }
  }, [user]); // Se ejecuta cada vez que cambia el usuario

  if (loading) {
    return <div>Loading...</div>; // Mostrar cargando mientras se obtiene el usuario
  }

  if (error) {
    return <div>{error}</div>; // Mostrar error si el usuario no tiene permisos
  }

  return (
    <div className="admin-panel">
      <div className="main-content">
        <Header />
        <Routes>
          <Route path="/admin/dashboard" element={<Dashboard />} />
          <Route path="/admin/events" element={<Events />} />
          <Route path="/admin/places" element={<Places />} />
          <Route path="/admin/users" element={<UsersManagement />} />
          <Route path="/admin/tickets" element={<SoldTickets />} />
          <Route path="*" element={<Navigate to="/admin/dashboard" />} />
        </Routes>
      </div>
    </div>
  );
};

export default AdminPanel;
