import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import './register.css'; // Asegúrate de importar el CSS correspondiente

const Register = () => {
  const [isModalOpen, setIsModalOpen] = useState(true); // Control de apertura del modal

  const handleCloseModal = () => {
    setIsModalOpen(false); // Cerrar el modal
  };

  return (
    <div>
      {/* Fondo oscuro detrás del modal */}
      {isModalOpen && (
        <div className="modal-overlay" onClick={handleCloseModal}></div>
      )}

      {/* Modal */}
      {isModalOpen && (
        <div className="register-modal">
          <h2 className="register-title">Create Your Account</h2>
          <form className="register-form">
            <div className="form-group">
              <label htmlFor="username">Username</label>
              <input
                type="text"
                id="username"
                placeholder="Enter your username"
                required
              />
            </div>
            <div className="form-group">
              <label htmlFor="email">Email</label>
              <input
                type="email"
                id="email"
                placeholder="Enter your email"
                required
              />
            </div>
            <div className="form-group">
              <label htmlFor="password">Password</label>
              <input
                type="password"
                id="password"
                placeholder="Enter your password"
                required
              />
            </div>
            <div className="form-buttons">
              <button type="submit" className="btn create-btn">Create Account</button>
              <Link to="/" className="btn cancel-btn">Cancel</Link>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};

export default Register;
