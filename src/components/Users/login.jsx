import React, { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { loginUser } from '../Redux/Actions/actions'; // Acción para hacer login
import { GoogleOAuthProvider, GoogleLogin } from '@react-oauth/google';
import { GoogleAuthProvider, signInWithCredential } from 'firebase/auth';
import { auth } from '../Firebase/firebase.config';
import { useNavigate } from 'react-router-dom';
import Swal from 'sweetalert2'; // Importamos SweetAlert2
import '../Users/login.css';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const user = useSelector((state) => state.user); // Accedemos al usuario desde el estado global

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      // Intentamos hacer login con los datos manuales
      await dispatch(loginUser(email, password));
      
      // Si el login es exitoso
      Swal.fire({
        icon: 'success',
        title: 'Login exitoso',
        text: 'Bienvenido a tu cuenta.',
      }).then(() => {
        navigate('/'); // Redirige a la página principal
      });
    } catch (error) {
      console.error('Error al hacer login manual', error.message);
      Swal.fire({
        icon: 'error',
        title: 'Error al iniciar sesión',
        text: 'Por favor verifica tus credenciales.',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleLogin = async (response) => {
    const provider = new GoogleAuthProvider();
    try {
      const credential = GoogleAuthProvider.credential(response.credential);
      const userCredential = await signInWithCredential(auth, credential);
      const user = userCredential.user;

      // Al hacer login con Google, actualizamos el estado global
      dispatch({
        type: 'LOGIN_SUCCESS',
        payload: {
          name: user.displayName,
          email: user.email,
          image: user.photoURL,
          role: 'user',
        },
      });

      // Muestra mensaje de éxito con SweetAlert
      Swal.fire({
        icon: 'success',
        title: 'Login exitoso',
        text: 'Bienvenido a tu cuenta.',
      }).then(() => {
        navigate('/'); // Redirige a la página principal
      });
    } catch (error) {
      console.error('Error al hacer login con Google', error.message);
    }
  };

  return (
    <div className="login-modal"> {/* Contenedor que cubre toda la pantalla */}
      <div className="login-container">
        <form onSubmit={handleSubmit} className="login-form">
          <h2>Login</h2>

          <div className="form-group">
            <label htmlFor="email">Email</label>
            <input
              type="email"
              id="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Enter your email"
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="password">Password</label>
            <input
              type="password"
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter your password"
              required
            />
          </div>

          <div className="form-buttons">
            <button type="submit" disabled={isLoading}>
              {isLoading ? 'Logging in...' : 'Login'}
            </button>
          </div>
        </form>

        {/* Login with Google */}
        <GoogleOAuthProvider clientId="credencial de google">
          <GoogleLogin
            onSuccess={handleGoogleLogin}
            onError={(error) => console.log('Error al iniciar sesión con Google:', error)}
            theme="outline"
            size="large"
          />
        </GoogleOAuthProvider>
      </div>
    </div>
  );
};

export default Login;
