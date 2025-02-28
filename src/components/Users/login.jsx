import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { login, loginWithGoogle } from '../Redux/Actions/actions';
import { GoogleOAuthProvider, GoogleLogin } from '@react-oauth/google';
import { GoogleAuthProvider, signInWithCredential } from 'firebase/auth';
import { auth } from '../Firebase/firebase.config';
import { useNavigate } from 'react-router-dom';
import Swal from 'sweetalert2'; // Importamos SweetAlert2
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faEye, faEyeSlash } from '@fortawesome/free-solid-svg-icons';
import '../Users/login.css';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);  // Controlar la visibilidad de la contraseña
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const user = useSelector((state) => state?.user);

  useEffect(() => {
    if (user) {
      Swal.fire({
        icon: 'success',
        title: 'Login exitoso',
        text: `Bienvenido, ${user.name}`,
      }).then(() => {
        navigate('/');
      });
    }
  }, [user, navigate]);

  useEffect(() => {
    const savedUser = localStorage.getItem('user');
    if (savedUser) {
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
      const response = await dispatch(login(email, password));
  
      if (response?.error) {
        Swal.fire({
          icon: 'error',
          title: 'Error al iniciar sesión',
          text: 'Por favor verifica correo y contraseña.',
        });
        return;
      }
  
      const userData = {
        name: response.name,
        email: response.email,
        isAdmin: response.isAdmin || false,  // Agregar isAdmin
        cashier: response.cashier || false,  // Agregar cashier
        image: response.image || '',  // Agregar image
        disabled: response.disabled || false,  // Agregar disabled
        id: response.id
      };
      localStorage.setItem('user', JSON.stringify(userData));
  
      dispatch({
        type: 'LOGIN_SUCCESS',
        payload: userData,
      });
  
      Swal.fire({
        icon: 'success',
        title: 'Login exitoso',
        text: `Bienvenido, ${response.name}`,
      }).then(() => {
        navigate('/');
      });
    } catch (error) {
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
      const googleUser = userCredential.user;

      const user = await dispatch(loginWithGoogle(googleUser.email));

      if (user?.error) {
        Swal.fire({
          icon: 'error',
          title: 'Usuario bloqueado',
          text: 'Tu cuenta ha sido deshabilitada. Por favor, contacta al soporte.',
        });
        return;
      }

      localStorage.setItem('user', JSON.stringify(user));

      Swal.fire({
        icon: 'success',
        title: 'Login exitoso',
        text: `Bienvenido, ${user.name}`,
      }).then(() => {
        navigate('/');
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
           {/* Insertamos la imagen debajo del título */}
           <img 
              src="/images/solticket.png" 
              alt="KI Logo" 
              className="Solticket-logo" 
              // style={{ width: '100px', height: '100px', objectFit: 'contain' }} 
            
            />

          <h2 className='title'>iniciar sesion</h2>

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

          <div>
            <div className="password-container">
            <label htmlFor="password">Password</label>
              <input
                type={showPassword ? 'text' : 'password'}
                id="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter your password"
                required
              />
              <FontAwesomeIcon 
                icon={showPassword ? faEyeSlash : faEye} 
                onClick={() => setShowPassword(!showPassword)} 
                style={{ cursor: 'pointer', position: 'absolute', right: '10px', top: '40px'}}
              />
            </div>
          </div>

          <div>
            <button className='form-buttons' disabled={isLoading}>
              {isLoading ? 'Logging in...' : 'Login'}
            </button>
          </div>
            <div className="google-logins">
             <GoogleOAuthProvider clientId= {process.env.REACT_APP_GOOGLE_CLIENT_ID}>
             <GoogleLogin className="google-logins"
             onSuccess={handleGoogleLogin}
             onError={(error) => console.log('Error al iniciar sesión con Google:', error)}
             theme="outline"
             size="medium"
             />
            </GoogleOAuthProvider>
            </div>
        
        

        
        </form>

      </div>
    </div>
  );
};

export default Login;