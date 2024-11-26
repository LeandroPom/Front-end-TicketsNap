import React, { useState } from 'react';
import './login.css'; // Asegúrate de tener los estilos

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(true); // Estado para controlar el modal

  const handleLogin = (e) => {
    e.preventDefault();
    // Aquí iría la lógica para enviar los datos de login
    console.log('Login realizado con:', { email, password });
  };

  const handleCancel = () => {
    setIsModalOpen(false); // Cerrar el modal al hacer clic en Cancel
  };

  if (!isModalOpen) return null; // Si el modal está cerrado, no renderizar nada

  return (
    <div className="login-modal">
      <div className="login-container">
        <h2>Login</h2>
        <form onSubmit={handleLogin}>
          <input
            type="email"
            name="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className="input-field"
          />
          <input
            type="password"
            name="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            className="input-field"
          />
          <div className="buttons">
            <button type="submit" className="btn login-btn">Login</button>
            <button type="button" className="btn cancel-btn" onClick={handleCancel}>Cancel</button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Login;
