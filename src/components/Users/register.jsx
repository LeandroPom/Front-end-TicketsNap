import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom'; // Agregamos useNavigate para redirigir
import { GoogleOAuthProvider, GoogleLogin } from '@react-oauth/google';
import { GoogleAuthProvider, signInWithCredential } from 'firebase/auth';
import { useDispatch, useSelector } from 'react-redux';
import { createUser, logoutUser } from '../Redux/Actions/actions';
import { auth } from '../Firebase/firebase.config';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faEye, faEyeSlash } from '@fortawesome/free-solid-svg-icons';
import Swal from 'sweetalert2'; // Importamos SweetAlert2
import axios from 'axios';

const Register = () => {
  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const dispatch = useDispatch();
  const navigate = useNavigate(); // Usamos el hook de navegación para redirigir
  const user = useSelector((state) => state?.user);
  const error = useSelector((state) => state?.user); // Obtenemos el estado de Redux
  const clientId = process.env.REACT_APP_GOOGLE_CLIENT_ID;
  const [isModalOpen, setIsModalOpen] = useState(true);
  const [showPassword, setShowPassword] = useState(false); // Estado para mostrar/ocultar la contraseña
  const [showConfirmPassword, setShowConfirmPassword] = useState(false); // Estado para mostrar/ocultar la confirmación de contraseña
  const [formData, setFormData] = useState({



    firstName: '',
    lastName: '',
    email: '',
    password: '',
    confirmPassword: '', // Campo de confirmación de contraseña
    phone: '',
    image: '',
  });

  useEffect(() => {
    if (user) {
      // Si el usuario se creó correctamente, mostrar el mensaje de éxito
      Swal.fire({
        icon: 'success',
        title: 'Registro exitoso',
        text: 'Tu cuenta ha sido creada con éxito.',
        customClass: {
          popup: 'custom-popup-success',  // Clase personalizada para el popup de éxito
        }
      }).then(() => {
        dispatch(logoutUser());
        navigate('/login'); // Redirigir al home o página principal
      });

      // Limpiar los campos del formulario
      setFormData({
        firstName: '',
        lastName: '',
        email: '',
        password: '',
        confirmPassword: '', // Limpiar confirmPassword
        phone: '',
        image: '',
      });
    } else if (error) {
      // Si hay un error en la creación del usuario, mostrar el mensaje de error
      Swal.fire({
        icon: 'error',
        title: 'Error en el registro',
        text: error || 'Hubo un problema al registrar tu cuenta. Intenta nuevamente.',
        customClass: {
          popup: 'custom-popup-success',  // Clase personalizada para el popup de éxito
        }
      });
    }
  }, [user, error, navigate]); // Este useEffect se ejecutará cuando el estado 'user' o 'error' cambien



  const handleCloseModal = () => {
    setIsModalOpen(false);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;

    setFormData((prevData) => ({
      ...prevData,
      [name]: value,
    }));

    // Validar el campo actualizado en tiempo real
    validateField(name, value);

    // Verificar correo si se cambia el valor
    if (name === 'email') {
      checkEmailExists(value);  // Verificar el correo cada vez que se cambie
    }
  };




  const validateField = (name, value) => {
    const newErrors = { ...errors };

    switch (name) {
      case 'firstName':
        newErrors.firstName = value ? '' : 'Nombre es requerido.';
        break;
      case 'lastName':
        newErrors.lastName = value ? '' : 'Apellido es requerido.';
        break;
      case 'email':
        newErrors.email = /\S+@\S+\.\S+/.test(value) ? '' : 'Por favor coloque un email valido.';
        break;
      case 'password':
        if (!value) {
          newErrors.password = 'La contraseña debe ser de 6 caracteres como minimo.';
        } else if (!/\d/.test(value) || !/[A-Za-z]/.test(value)) {
          newErrors.password = 'La contraseña debe contener al menos una letra y un numero.';
        } else {
          newErrors.password = '';
        }
        break;
      case 'confirmPassword':
        newErrors.confirmPassword = value === formData.password ? '' : 'Las contraseñas no coinciden';
        break;
      case 'phone':
        newErrors.phone = value ? '' : 'Numero de celular es requerido';
        break;
      default:
        break;
    }

    setErrors(newErrors);
  };



  const validateForm = () => {
    const newErrors = {};

    // Validación de los campos
    if (!formData.firstName) newErrors.firstName = "Nombre es requerido.";
    if (!formData.lastName) newErrors.lastName = "Apellido es requerido.";

    // Validación del correo
    if (!formData.email || !/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = "Por favor coloque un email valido.";

      if (formData.password !== formData.confirmPassword) {
        newErrors.confirmPassword = "Las contraseñas no coinciden.";
      }
    }

    // Validación de las contraseñas
    if (!formData.password || formData.password.length < 6) {
      newErrors.password = "La contraseña debe ser de 6 caracteres como minimo.";
    }
    if (!/\d/.test(formData.password) || !/[A-Za-z]/.test(formData.password)) {
      newErrors.password = "La contraseña debe contener al menos una letra y un numero.";
    }

    // Verificar si las contraseñas coinciden


    if (!formData.phone) {
      newErrors.phone = "Numero de celular es requerido."; // Campo de teléfono obligatorio
    }

    setErrors(newErrors);

    return Object.keys(newErrors).length === 0; // Solo pasa si no hay errores
  };


  const handleSubmit = async (e) => {
    e.preventDefault();

    // Primero, verificar si el correo o el nombre ya existen
    const emailExists = await checkEmailExists(formData.email);
    if (emailExists) {
      Swal.fire({
        icon: 'error',
        title: 'Correo ya registrado',
        text: 'Este correo ya está asociado a una cuenta.',
        customClass: {
          popup: 'custom-popup-success',  // Clase personalizada para el popup de éxito
        }
      });
      return;  // Detener el proceso si el correo ya existe
    }

    // Validar si la contraseña es suficientemente larga (mínimo 6 caracteres)
    if (formData.password.length < 6) {
      setErrors((prevErrors) => ({
        ...prevErrors,
        password: 'La contraseña debe tener al menos 6 caracteres.'
      }));
      return;
    }

    // Verificar que las contraseñas coincidan
    if (formData.password !== formData.confirmPassword) {
      setErrors((prevErrors) => ({
        ...prevErrors,
        confirmPassword: 'Las contraseñas no coinciden.'
      }));
      return;
    }

    const usernameExists = await checkUsernameExists(formData.firstName + ' ' + formData.lastName);  // Asegúrate de que sea el nombre completo
    if (usernameExists) {
      Swal.fire({
        icon: 'error',
        title: 'Nombre de usuario ya registrado',
        text: 'Este nombre de usuario ya está asociado a una cuenta.',
        customClass: {
          popup: 'custom-popup-success',  // Clase personalizada para el popup de éxito
        }
      });
      return;  // Detener el proceso si el nombre de usuario ya existe
    }

    // Validar el formulario antes de enviar
    if (!validateForm()) {
      Swal.fire({
        icon: 'error',
        title: 'Oops...',
        text: 'Por favor, corrige los errores antes de enviar.',
        customClass: {
          popup: 'custom-popup-success',  // Clase personalizada para el popup de éxito
        }
      });
      return;
    }

    setIsLoading(true);

    try {
      const userData = {
        name: `${formData.firstName} ${formData.lastName}`,
        email: formData.email,
        password: formData.password,
        image: formData.image,
        confirmPassword: formData.confirmPassword,
        phone: formData.phone,
        role: 'user',
      };

      // Despachar la acción para crear el usuario
      await dispatch(createUser(userData));

      Swal.fire({
        icon: 'success',
        title: 'Registro exitoso',
        text: 'Tu cuenta ha sido creada con éxito.',
        customClass: {
          popup: 'custom-popup-success',  // Clase personalizada para el popup de éxito
        }
      }).then(() => {
        dispatch(logoutUser());
        navigate('/login');  // Redirigir a la página principal
      });

      // Limpiar el formulario
      setFormData({
        firstName: '',
        lastName: '',
        email: '',
        password: '',
        confirmPassword: '',
        phone: '',
        image: '',
      });
    } catch (error) {
      console.error('Error al registrar usuario:', error?.message);
      Swal.fire({
        icon: 'error',
        title: 'Error en el registro',
        text: 'Hubo un problema al registrar tu cuenta. Intenta nuevamente.',
        customClass: {
          popup: 'custom-popup-success',  // Clase personalizada para el popup de éxito
        }
      });
    } finally {
      setIsLoading(false);
    }
  };





  const generateRandomPassword = () => {
    return Math.random().toString(36).slice(-8); // Genera una contraseña aleatoria de 8 caracteres
  };


  const checkEmailExists = async (email) => {
    try {
      const response = await axios.get('/users');

      // Muestra toda la respuesta
      // console.log('Respuesta del servidor:', response.data);

      if (!Array.isArray(response.data)) {
        console.error('La respuesta no es un array:', response.data);
        return false;
      }

      const emailExists = response.data.some((user) => user.email === email);
      return emailExists;
    } catch (error) {
      console.error('Error al verificar el correo:', error.message);
      return false;
    }
  };

  const checkUsernameExists = async (name) => {
    try {
      const response = await axios.get('/users');  // Asegúrate de que esta URL sea la correcta
      // console.log('Respuesta del servidor:', response.data);

      if (!Array.isArray(response.data)) {
        console.error('La respuesta no es un array:', response.data);
        return false;
      }

      const usernameExists = response.data.some((user) => user.name === name);
      return usernameExists;
    } catch (error) {
      console.error('Error al verificar el nombre de usuario:', error.message);
      return false;
    }
  };




  const handleGoogleRegister = async (response) => {
    const provider = new GoogleAuthProvider();
    try {
      const credential = GoogleAuthProvider.credential(response.credential);
      const userCredential = await signInWithCredential(auth, credential);
      const user = userCredential.user;

      // Verificar si el correo ya está registrado
      const emailExists = await checkEmailExists(user.email);

      if (emailExists) {
        Swal.fire({
          icon: 'error',
          title: 'Correo ya registrado',
          text: 'Este correo ya está asociado a una cuenta.',
          customClass: {
            popup: 'custom-popup-success',  // Clase personalizada para el popup de éxito
          }
        });
        return;  // Detener el flujo si el correo ya existe
      }

      // Generar una contraseña aleatoria para la creación del usuario
      const temporaryPassword = generateRandomPassword();

      const userData = {
        name: user.displayName,
        email: user.email,
        image: user.photoURL,
        password: temporaryPassword,  // Usamos la contraseña temporal
        role: 'user',
        google: true,  // Asegurarse de que se pase google: true
      };

      // Despachar la acción de crear el usuario
      dispatch(createUser(userData));

      // Mostrar SweetAlert de éxito
      Swal.fire({
        icon: 'success',
        title: 'Registro correcto',
        text: 'Bienvenido, tu cuenta de Google ha sido registrada con éxito.',
        customClass: {
          popup: 'custom-popup-success',  // Clase personalizada para el popup de éxito
        }
      }).then(() => {
        setIsModalOpen(false);
        dispatch(logoutUser())
        navigate('/login');
      });

    } catch (error) {
      console.error("Error logging in with Google:", error.message);
      // Aquí podrías manejar otro tipo de errores si es necesario.
    }
  };

  // Función para redirigir a la página principal
  const handleCancel = () => {
    navigate('/');  // Redirige a la página principal
  };

  // Cambiar el estado de showPassword para mostrar u ocultar la contraseña
  const togglePasswordVisibility = () => setShowPassword(!showPassword);

  // Cambiar el estado de showConfirmPassword para mostrar u ocultar la confirmación de contraseña
  const toggleConfirmPasswordVisibility = () => setShowConfirmPassword(!showConfirmPassword);


return (
  <div>
    {isModalOpen && (
      <div className="mt-[170px] fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 p-4">
       <div className="container-bg backdrop-blur-lg rounded-2xl shadow-2xl p-6 w-full max-w-4xl max-h-[60vh] overflow-y-auto">

          
          {/* Título */}
          <h2 className="text-3xl font-bold text-center text-white mb-6">
            Crea tu cuenta
          </h2>

          {/* Formulario */}
          <form className="space-y-5" onSubmit={handleSubmit}>

            {/* Nombre y Correo */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label htmlFor="firstName" className="block text-white font-semibold mb-2">
                  Nombre
                </label>
                <input
                  type="text"
                  id="firstName"
                  name="firstName"
                  value={formData.firstName}
                  onChange={handleInputChange}
                  required
                  className="w-full p-2 rounded-md rounded bg-[rgba(55,55,248,0.25)] border border-white/40 text-white placeholder-white/70 focus:outline-none focus:ring-2 focus:ring-blue-300"
                />
                {errors.firstName && <small className="text-red-400">{errors.firstName}</small>}
              </div>

              <div>
                <label htmlFor="email" className="block text-white font-semibold mb-2">
                  Correo
                </label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  placeholder="Coloca tu correo real"
                  required
                  className="w-full p-2 rounded-md rounded bg-[rgba(55,55,248,0.25)] border border-white/40 text-white placeholder-white/70 focus:outline-none focus:ring-2 focus:ring-blue-300"
                />
                {errors.email && <small className="text-red-400">{errors.email}</small>}
              </div>
            </div>

            {/* Apellido y Teléfono */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label htmlFor="lastName" className="block text-white font-semibold mb-2">
                  Apellido
                </label>
                <input
                  type="text"
                  id="lastName"
                  name="lastName"
                  value={formData.lastName}
                  onChange={handleInputChange}
                  required
                  className="w-full p-2 rounded-md rounded bg-[rgba(55,55,248,0.25)] border border-white/40 text-white placeholder-white/70 focus:outline-none focus:ring-2 focus:ring-blue-300"
                />
                {errors.lastName && <small className="text-red-400">{errors.lastName}</small>}
              </div>

              <div>
                <label htmlFor="phone" className="block text-white font-semibold mb-2">
                  Número de celular
                </label>
                <input
                  type="text"
                  id="phone"
                  name="phone"
                  value={formData.phone}
                  onChange={handleInputChange}
                  placeholder="Ej: 38115403286"
                  maxLength="12"
                  className="w-full p-2 rounded-md rounded bg-[rgba(55,55,248,0.25)] border border-white/40 text-white placeholder-white/70 focus:outline-none focus:ring-2 focus:ring-blue-300"
                />
              </div>
            </div>

            {/* Contraseña y Confirmar */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-4">
              <div className="flex items-center gap-2">
                <div className="flex-1">
                  <label htmlFor="password" className="block text-white font-semibold mb-2">
                    Contraseña
                  </label>
                  <input
                    type={showPassword ? 'text' : 'password'}
                    id="password"
                    name="password"
                    value={formData.password}
                    onChange={handleInputChange}
                    required
                    className="w-full p-2 rounded-md rounded bg-[rgba(55,55,248,0.25)] border border-white/40 text-white placeholder-white/70 focus:outline-none focus:ring-2 focus:ring-blue-300"
                  />
                  {errors.password && <small className="text-red-400">{errors.password}</small>}
                </div>
                <button
                  type="button"
                  onClick={togglePasswordVisibility}
                  className="text-white mt-6 p-1 hover:text-blue-300 ml-[-20px]"
                  aria-label="Mostrar/Ocultar contraseña"
                >
                  <FontAwesomeIcon icon={showPassword ? faEyeSlash : faEye} size="lg" />
                </button>
              </div>

              <div className="flex items-center gap-2">
                <div className="flex-1">
                  <label htmlFor="confirmPassword" className="block text-white font-semibold mb-2">
                    Confirmar
                  </label>
                  <input
                    type={showConfirmPassword ? 'text' : 'password'}
                    id="confirmPassword"
                    name="confirmPassword"
                    value={formData.confirmPassword}
                    onChange={handleInputChange}
                    required
                    className="w-full p-2 rounded-md rounded bg-[rgba(55,55,248,0.25)] border border-white/40 text-white placeholder-white/70 focus:outline-none focus:ring-2 focus:ring-blue-300"
                  />
                  {errors.confirmPassword && <small className="text-red-400">{errors.confirmPassword}</small>}
                </div>
                <button
                  type="button"
                  onClick={toggleConfirmPasswordVisibility}
                  className="text-white mt-6 p-1 hover:text-blue-300 ml-[-20px]"
                  aria-label="Mostrar/Ocultar confirmar contraseña"
                >
                  <FontAwesomeIcon icon={showConfirmPassword ? faEyeSlash : faEye} size="lg" />
                </button>
              </div>
            </div>

            {/* Botones */}
            <div className="flex flex-col md:flex-row gap-4 pt-4">
              <button
                type="submit"
                className="secondary w-auto text-white px-4 py-2 rounded-md font-semibold transition-colors"
              >
                Crear Cuenta
              </button>
              <button
                type="button"
                onClick={handleCancel}
                className="secondary w-auto text-white px-4 py-2 rounded-md font-semibold transition-colors"
              >
                Cancelar
              </button>
            </div>

            {/* Google Login */}
            <div className="flex justify-center pt-2">
              <GoogleOAuthProvider clientId={clientId}>
                <GoogleLogin
                  onSuccess={handleGoogleRegister}
                  onError={() => console.log('Login failed')}
                  useOneTap
                  theme="outline"
                  size="medium"
                />
              </GoogleOAuthProvider>
            </div>
          </form>
        </div>
      </div>
    )}
  </div>
);



};

export default Register;


