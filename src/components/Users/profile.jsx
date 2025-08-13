import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux'; 
import { useNavigate } from 'react-router-dom'; // Importamos useNavigate
import axios from 'axios';
import Swal from 'sweetalert2';
import { useDispatch } from 'react-redux';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faEye, faEyeSlash } from '@fortawesome/free-solid-svg-icons';


const Profile = () => {
  const user = useSelector((state) => state?.user);
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isUserLoading, setIsUserLoading] = useState(true);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const dispatch = useDispatch();
  const navigate = useNavigate(); // Hook para redireccionar

  useEffect(() => {
    if (user) {
      setIsUserLoading(false);
    }
  }, [user]);

  const handleChangePassword = async (e) => {
    e.preventDefault();
  
    if (newPassword !== confirmPassword) {
      Swal.fire({
        icon: 'error',
        title: 'Contraseñas no coinciden',
        text: 'Por favor verifica que ambas contraseñas sean iguales.',
        customClass: {
          popup: 'custom-popup-success',  // Clase personalizada para el popup de éxito
        }
      });
      return;
    }
  
    setIsLoading(true);
  
    try {
      const response = await axios.put('/users/edit', {
        email: user.email,
        updates: {
          password: newPassword,
        },
      });

      if (response.data.user) {
        dispatch({ type: 'UPDATE_USER', payload: response.data.user });
      
        Swal.fire({
          icon: 'success',
          title: 'Contraseña actualizada',
          text: response.data.message || 'Tu contraseña ha sido cambiada exitosamente.',
          customClass: {
            popup: 'custom-popup-success',  // Clase personalizada para el popup de éxito
          }
        });
      
        setNewPassword('');
        setConfirmPassword('');
      } else {
        Swal.fire({
          icon: 'error',
          title: 'Error al cambiar la contraseña',
          text: response.data.error || 'Hubo un problema al cambiar la contraseña.',
          customClass: {
            popup: 'custom-popup-success',  // Clase personalizada para el popup de éxito
          }
        });
      }
    } finally {
      setIsLoading(false);
    }
  };

  if (isUserLoading) {
    return <div>Loading profile...</div>;
  }

  return (
  <div className="mt-[90px] min-h-screen flex items-center justify-center p-4 bg-gradient-to-b from-[rgba(86,86,190,0.4)] to-[rgba(86,86,190,0.4)] backdrop-blur-md">
    <div className="w-full max-w-md bg-[rgba(86,86,190,0.4)] backdrop-blur-md rounded-lg p-6 shadow-lg text-white">
      
      <h2 className="text-2xl md:text-3xl font-bold text-center mb-6">Mi perfil</h2>
      
      <div className="mb-6 space-y-2">
        <p><strong>Nombre:</strong> {user?.name}</p>
        <p><strong>Correo:</strong> {user?.email}</p>
      </div>

      <button
        onClick={() => navigate('/profile/miscompras')}
        className=" mb-6 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded transition-colors"
      >
        Mis Compras
      </button>

      <div className="change-password">
        <h3 className="text-xl font-semibold mb-4">Cambiar contraseña</h3>
        <form onSubmit={handleChangePassword} className="flex flex-col gap-6">
          
          <div className="flex flex-col relative">
            <label htmlFor="newPassword" className="mb-1 font-semibold">Nueva contraseña</label>
            <input
              type={showNewPassword ? 'text' : 'password'}
              id="newPassword"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              required
              className="p-2 rounded bg-[rgba(70,70,140,0.7)] border border-white text-white focus:outline-none focus:ring-2 focus:ring-blue-400 w-full"
            />
            <FontAwesomeIcon
              icon={showNewPassword ? faEyeSlash : faEye}
              onClick={() => setShowNewPassword(!showNewPassword)}
              className="absolute right-3 top-10 text-white cursor-pointer"
            />
          </div>

          <div className="flex flex-col relative">
            <label htmlFor="confirmPassword" className="mb-1 font-semibold">Confirmar contraseña</label>
            <input
              type={showConfirmPassword ? 'text' : 'password'}
              id="confirmPassword"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
              className="p-2 rounded bg-[rgba(70,70,140,0.7)] border border-white text-white focus:outline-none focus:ring-2 focus:ring-blue-400 w-full"
            />
            <FontAwesomeIcon
              icon={showConfirmPassword ? faEyeSlash : faEye}
              onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              className="absolute right-3 top-10 text-white cursor-pointer"
            />
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded transition-colors"
          >
            {isLoading ? 'Cambiando...' : 'Cambiar Contraseña'}
          </button>
        </form>
      </div>
    </div>
  </div>
);

};

export default Profile;
