import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux'; 
import axios from 'axios';
import Swal from 'sweetalert2';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faEye, faEyeSlash } from '@fortawesome/free-solid-svg-icons';
import './login.css';

const Profile = () => {
  const user = useSelector((state) => state?.user); // Obtenemos el usuario desde el estado global
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isUserLoading, setIsUserLoading] = useState(true); 
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);  // Controlar la visibilidad de la contraseña
  const [showNewPassword, setShowNewPassword] = useState(false);        // Controlar la visibilidad de la nueva contraseña
  const [showConfirmPassword, setShowConfirmPassword] = useState(false); // Controlar la visibilidad de la confirmación

  const dispatch = useDispatch();

  useEffect(() => {
    if (user) {
      setIsUserLoading(false); // Si el usuario está cargado, cambiamos el estado de carga
    }
  }, [user]);

  const handleChangePassword = async (e) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      Swal.fire({
        icon: 'error',
        title: 'Contraseñas no coinciden',
        text: 'Por favor verifica que ambas contraseñas sean iguales.',
      });
      return;
    }

    setIsLoading(true);

    try {
      const response = await axios.put('http://localhost:3001/users/edit', {
        userId: user.id,
        currentPassword,
        newPassword,
      });

      if (response.data.success) {
        Swal.fire({
          icon: 'success',
          title: 'Contraseña actualizada',
          text: 'Tu contraseña ha sido cambiada exitosamente.',
        });
        setCurrentPassword('');
        setNewPassword('');
        setConfirmPassword('');
      } else {
        Swal.fire({
          icon: 'error',
          title: 'Error al cambiar la contraseña',
          text: response.data.error || 'Hubo un problema al cambiar la contraseña.',
        });
      }
    } catch (error) {
      Swal.fire({
        icon: 'error',
        title: 'Error al cambiar la contraseña',
        text: error.message || 'Hubo un problema al cambiar la contraseña.',
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Si el estado del usuario aún se está cargando, mostramos un mensaje de carga
  if (isUserLoading) {
    return <div>Loading profile...</div>;
  }

  return (
    <div className="profile-container">
      <h2>My profile</h2>
      <div className="profile-info">
        <p><strong>Name:</strong> {user?.name}</p>
        <p><strong>Email:</strong> {user?.email}</p>
      </div>

      <div className="change-password">
        <h3>change Password</h3>
        <form onSubmit={handleChangePassword}>
          <div className="form-group">
            <label htmlFor="currentPassword">Current Password</label>
            <div className="password-container">
              <input
                type={showCurrentPassword ? 'text' : 'password'}
                id="currentPassword"
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                required
              />
              <FontAwesomeIcon 
                icon={showCurrentPassword ? faEyeSlash : faEye} 
                onClick={() => setShowCurrentPassword(!showCurrentPassword)} 
                style={{ cursor: 'pointer', position: 'absolute', right: '10px', top: '50%', transform: 'translateY(-50%)' }}
              />
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="newPassword">New Password</label>
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
            <label htmlFor="confirmPassword">Confirm New Password</label>
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
            <button type="submit" disabled={isLoading}>
              {isLoading ? 'Cambiando...' : 'Cambiar Contraseña'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Profile;
