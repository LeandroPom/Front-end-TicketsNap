import React from 'react';
import { Navigate } from 'react-router-dom';
import { useSelector } from 'react-redux'; // Asegúrate de que esto esté correcto

const AdminRoute = ({ children }) => {
  const user = useSelector((state) => state.user);

  // Si el usuario no es administrador, redirige a la página de inicio o a donde lo necesites
  if (!user || !user.isAdmin) {
    return <Navigate to="/" />;
  }

  return children;
};

export default AdminRoute;
