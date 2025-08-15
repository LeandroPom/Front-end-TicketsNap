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
        customClass: {
          popup: 'custom-popup-success',  // Clase personalizada para el popup de éxito
        }
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
      // Ejecutamos la acción de login solo con email y password
      const response = await dispatch(login(email, password));
  
      // Verificar si hubo un error en la respuesta
      if (response?.error) {
        if (response.error === 'Cuenta deshabilitada') {
          // Si la cuenta está deshabilitada, mostramos un mensaje específico
          Swal.fire({
            icon: 'error',
            title: 'Cuenta Deshabilitada',
            text: 'Tu cuenta está deshabilitada. Por favor contacta con el administrador.',
            customClass: {
              popup: 'custom-popup-error',
            }
          });
        } else {
          // Si es otro tipo de error (como credenciales incorrectas), mostramos el error correspondiente
          Swal.fire({
            icon: 'error',
            title: 'Error al iniciar sesión',
            text: response.error === 'Credenciales incorrectas' 
              ? 'Por favor verifica correo y contraseña.'
              : 'Correo o contraseña incorrectas.',
            customClass: {
              popup: 'custom-popup-error',
            }
          });
        }
        return; // Detenemos el flujo en caso de error
      }
  
      // Si la cuenta no está deshabilitada, continuamos con el flujo normal
      const userData = {
        name: response.name,
        email: response.email,
        isAdmin: response.isAdmin || false,
        cashier: response.cashier || false,
        image: response.image || '',
        disabled: response.disabled || false,
        id: response.id,
      };
  
      // Guardamos los datos del usuario en localStorage
      localStorage.setItem('user', JSON.stringify(userData));
  
      // Realizamos la acción de login exitosa en Redux
      dispatch({
        type: 'LOGIN_SUCCESS',
        payload: userData,
      });
  
      // Mostramos el mensaje de éxito
      Swal.fire({
        icon: 'success',
        title: 'Login exitoso',
        text: `Bienvenido, ${response.name}`,
        customClass: {
          popup: 'custom-popup-success',
        }
      }).then(() => {
        navigate('/');
      });
    } catch (error) {
      // Si ocurre algún error, mostramos el mensaje correspondiente
      Swal.fire({
        icon: 'error',
        title: 'Error al iniciar sesión',
        text: 'Por favor verifica tus credenciales.',
        customClass: {
          popup: 'custom-popup-error',
        }
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
          customClass: {
            popup: 'custom-popup-success',  // Clase personalizada para el popup de éxito
          }
        });
        return;
      }

      localStorage.setItem('user', JSON.stringify(user));

      Swal.fire({
        icon: 'success',
        title: 'Login exitoso',
        text: `Bienvenido, ${user.name}`,
        customClass: {
          popup: 'custom-popup-success',  // Clase personalizada para el popup de éxito
        }
      }).then(() => {
        navigate('/');
      });
    } catch (error) {
      Swal.fire({
        icon: 'error',
        title: 'Error al iniciar sesión',
        text: error.message || 'No se pudo iniciar sesión con Google.',
        customClass: {
          popup: 'custom-popup-success',  // Clase personalizada para el popup de éxito
        }
      });
    }
  };

  return (
  <div className="mt-[90px] min-h-screen flex items-center justify-center p-4 bg-gradient-to-b from-[rgba(86,86,190,0.4)] to-[rgba(86,86,190,0.4)] backdrop-blur-md">
    <div className="w-full max-w-md bg-[rgba(86,86,190,0.4)] backdrop-blur-md rounded-lg p-6 shadow-lg">
      <form onSubmit={handleSubmit} className="flex flex-col gap-6">
        
        {/* Logo */}
        <img
          src="/images/solticket.png"
          alt="Solticket Logo"
          className="mx-auto w-24 h-24 object-contain"
        />

        {/* Título */}
        <h2 className="text-2xl md:text-3xl font-bold text-center text-white">
          Iniciar sesión
        </h2>

        {/* Email */}
        <div className="flex flex-col">
          <label htmlFor="email" className="text-white font-semibold mb-1">Email</label>
          <input
            type="email"
            id="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Ingresa tu email"
            required
            className="form-input p-2 rounded bg-[rgba(70,70,140,0.7)] border border-white text-white focus:outline-none focus:ring-2 focus:ring-blue-400 w-full"
          />
        </div>

        {/* Contraseña */}
        <div className="relative flex flex-col">
          <label htmlFor="password" className="text-white font-semibold mb-1">Contraseña</label>
          <input
            type={showPassword ? 'text' : 'password'}
            id="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Ingresa tu contraseña"
            required
            className="form-input p-2 rounded bg-[rgba(70,70,140,0.7)] border border-white text-white focus:outline-none focus:ring-2 focus:ring-blue-400 w-full"
          />
          <FontAwesomeIcon
            icon={showPassword ? faEyeSlash : faEye}
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-3 top-10 text-white cursor-pointer"
          />
        </div>

        {/* Botones */}
        <div className="flex flex-col gap-3">
          <button
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded transition-colors"
            disabled={isLoading}
          >
            {isLoading ? 'Ingresando...' : 'Ingresar'}
          </button>
          <button
            type="button"
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded transition-colors"
            onClick={() => navigate('/register')}
          >
            Registrarse
          </button>
        </div>

        {/* Login con Google */}
        <div className="flex justify-center">
          <GoogleOAuthProvider clientId={process.env.REACT_APP_GOOGLE_CLIENT_ID}>
            <GoogleLogin
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
