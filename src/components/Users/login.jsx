import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { loginUser,loginWithGoogle } from '../Redux/Actions/actions'; // Acción para hacer login
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

  // Accedemos al usuario desde el estado global para mostrar el nombre
  const user = useSelector((state) => state?.user); // Cambié `state.user` a `state.user.user`

  useEffect(() => {
    if (user) {
      // Si el login es exitoso, mostramos el mensaje de éxito y redirigimos
      Swal.fire({
        icon: 'success',
        title: 'Login exitoso',
        text: `Bienvenido, ${user.name}`, // Mostramos el nombre del usuario
      }).then(() => {
        navigate('/'); // Redirige a la página principal
      });
    }
  }, [user, navigate]); // Dependemos de `user` para hacer la redirección


  useEffect(() => {
    const savedUser = localStorage.getItem('user');
    if (savedUser) {
      // Si hay un usuario guardado en localStorage, despachamos la acción para cargarlo en Redux
      dispatch({
        type: 'LOGIN_SUCCESS',
        payload: JSON.parse(savedUser),
      });
    }
  }, [dispatch]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      // Intentamos hacer login con los datos manuales
      const response = await dispatch(loginUser(email, password));
  
      if (response) {
        // Asegúrate de que el nombre del usuario esté bien formateado
        const userData = {
          name: response.name, // Nombre del usuario
          email: response.email,
          role: 'user',
        };
  
        // Guardar el usuario en localStorage
        localStorage.setItem('user', JSON.stringify(userData));
  
        // Despachar la acción de login
        dispatch({
          type: 'LOGIN_SUCCESS',
          payload: userData,
        });
  
        Swal.fire({
          icon: 'success',
          title: 'Login exitoso',
          text: `Bienvenido, ${response.name}`,
        }).then(() => {
          navigate('/'); // Redirige a la página principal
        });
      }
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
      // Obtener credenciales de Google
      const credential = GoogleAuthProvider.credential(response.credential);
      const userCredential = await signInWithCredential(auth, credential);
      const googleUser = userCredential.user;
  
      // Llamar a la nueva acción para verificar en la base de datos local
      const user = await dispatch(loginWithGoogle(googleUser.email));
  
      // Guardar en localStorage y estado global
      localStorage.setItem('user', JSON.stringify(user));
  
      Swal.fire({
        icon: 'success',
        title: 'Login exitoso',
        text: `Bienvenido, ${user.name}`,
      }).then(() => {
        navigate('/'); // Redirigir a la página principal
      });
    } catch (error) {
      Swal.fire({
        icon: 'error',
        title: 'Error al iniciar sesión',
        text: error.message || 'No se pudo iniciar sesión con Google.',
      });
    }
  };
  
  
  

  return (
    <div className="login-modal">
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
        <GoogleOAuthProvider clientId="220270807051-k0j1nanf7am7do9garnpb5c4u4lmmd8p.apps.googleusercontent.com">
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
