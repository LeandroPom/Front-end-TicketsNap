import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux'; 
import { useNavigate } from 'react-router-dom'; // Importamos useNavigate
import axios from 'axios';
import Swal from 'sweetalert2';
import { useDispatch } from 'react-redux';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faEye, faEyeSlash } from '@fortawesome/free-solid-svg-icons';
import './profile.css';

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
    <div className="profile-container">
      <h2 className='profile-title'>Mi perfil</h2>
      <div className="profile-info">
        <p><strong>Nombre:</strong> {user?.name}</p>
        <p><strong>Correo:</strong> {user?.email}</p>
      </div>

      <button onClick={() => navigate('/profile/miscompras')} className="my-purchases-button">
        Mis Compras
      </button>

      <div className="change-password">
        <h3>Cambiar contraseña</h3>
        <form onSubmit={handleChangePassword} className='form-profile'>
          <div className="form-group">
            <label htmlFor="newPassword">Nueva contraseña</label>
            <div className="password-container">
              <input
                type={showNewPassword ? 'text' : 'password'}
                id="newPassword"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                required
              />
              <FontAwesomeIcon 
                icon={showNewPassword ? faEyeSlash : faEye} 
                onClick={() => setShowNewPassword(!showNewPassword)} 
                style={{ cursor: 'pointer', position: 'absolute', right: '10px', top: '50%', transform: 'translateY(-50%)' }}
              />
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="confirmPassword">Confirmar contraseña</label>
            <div className="password-container">
              <input
                type={showConfirmPassword ? 'text' : 'password'}
                id="confirmPassword"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
              />
              <FontAwesomeIcon 
                icon={showConfirmPassword ? faEyeSlash : faEye} 
                onClick={() => setShowConfirmPassword(!showConfirmPassword)} 
                style={{ cursor: 'pointer', position: 'absolute', right: '10px', top: '50%', transform: 'translateY(-50%)' }}
              />
            </div>
          </div>

          <div className="form-group">
            <button type="submits" disabled={isLoading}>
              {isLoading ? 'Cambiando...' : 'Cambiar Contraseña'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Profile;
