import React, { useState,useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom'; // Agregamos useNavigate para redirigir
import './register.css'; 
import { GoogleOAuthProvider, GoogleLogin } from '@react-oauth/google';
import { GoogleAuthProvider, signInWithCredential } from 'firebase/auth';
import { useDispatch, useSelector } from 'react-redux';
import { createUser } from '../Redux/Actions/actions';
import { auth } from '../Firebase/firebase.config'; 
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
      }).then(() => {
        navigate('/'); // Redirigir al home o página principal
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
  
    
  
    // Verificar correo si se cambia el valor
    if (name === 'email') {
      checkEmailExists(value);  // Verificar el correo cada vez que se cambie
    }
  };
  


  const validateForm = () => {
    const newErrors = {};
  
    // Validación de los campos
    if (!formData.firstName) newErrors.firstName = "First name is required.";
    if (!formData.lastName) newErrors.lastName = "Last name is required.";
    
    // Validación del correo
    if (!formData.email || !/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = "Please enter a valid email address.";

      if (formData.password !== formData.confirmPassword) {
        newErrors.confirmPassword = "Las contraseñas no coinciden.";
      }
    }
  
    // Validación de las contraseñas
    if (!formData.password || formData.password.length < 6) {
      newErrors.password = "Password must be at least 6 characters long.";
    }
    if (!/\d/.test(formData.password) || !/[A-Za-z]/.test(formData.password)) {
      newErrors.password = "Password must contain at least one letter and one number.";
    }
  
    // Verificar si las contraseñas coinciden
    
  
    if (!formData.phone) {
      newErrors.phone = "Phone number is required."; // Campo de teléfono obligatorio
    }
  
    setErrors(newErrors);
  
    return Object.keys(newErrors).length === 0; // Solo pasa si no hay errores
  };
  
  useEffect(() => {
    if (user) {
      // Si el usuario se creó correctamente, mostrar el mensaje de éxito
      Swal.fire({
        icon: 'success',
        title: 'Registro exitoso',
        text: 'Tu cuenta ha sido creada con éxito.',
      }).then(() => {
        navigate('/'); // Redirigir al home o página principal
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
      });
    }
  }, [user, error, navigate]); // Este useEffect se ejecutará cuando el estado 'user' o 'error' cambien

   



  const handleSubmit = async (e) => {
    e.preventDefault();
  
    // Primero, verificar si el correo o el nombre ya existen
    const emailExists = await checkEmailExists(formData.email);
    if (emailExists) {
      Swal.fire({
        icon: 'error',
        title: 'Correo ya registrado',
        text: 'Este correo ya está asociado a una cuenta.',
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
      });
      return;  // Detener el proceso si el nombre de usuario ya existe
    }
  
    // Validar el formulario antes de enviar
    if (!validateForm()) {
      Swal.fire({
        icon: 'error',
        title: 'Oops...',
        text: 'Por favor, corrige los errores antes de enviar.',
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
      }).then(() => {
        navigate('/');  // Redirigir a la página principal
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
      console.log('Respuesta del servidor:', response.data);
  
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
      console.log('Respuesta del servidor:', response.data);
  
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
      }).then(() => {
        setIsModalOpen(false);
        navigate('/');
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

  
  return (
    <div>
      {isModalOpen && (
        <div className="modal-overlay" onClick={handleCloseModal}></div>
      )}

      {isModalOpen && (
        <div className="register-modal">
          <h2 className="register-title">Create-Account</h2>
          <form className="register-form" onSubmit={handleSubmit}>
  {/* Primera fila: First Name y Email */}
  <div className="form-row">
    <div className="form-group">
      <label htmlFor="firstName">First Name</label>
      <input
        type="text"
        id="firstName"
        name="firstName"
        value={formData.firstName}
        onChange={handleInputChange}
        // placeholder="Enter your first name"
        required
      />
      {errors.firstName && <small>{errors.firstName}</small>}
    </div>
    <div className="form-group">
      <label htmlFor="email">Email</label>
      <input
        type="email"
        id="email"
        name="email"
        value={formData.email}
        onChange={handleInputChange}
        // placeholder="Enter your email"
        required
      />
      {errors.email && <small>{errors.email}</small>}
    </div>
  </div>
  

  {/* Segunda fila: Last Name y Password */}
  <div className="form-row">
    <div className="form-group">
      <label htmlFor="lastName">Last Name</label>
      <input
        type="text"
        id="lastName"
        name="lastName"
        value={formData.lastName}
        onChange={handleInputChange}
        // placeholder="Enter your last name"
        required
      />
      {errors.lastName && <small>{errors.lastName}</small>}
    </div>
    <div className="form-group">
      <label htmlFor="password">Password</label>
      <input
        type="password"
        id="password"
        name="password"
        value={formData.password}
        onChange={handleInputChange}
        // placeholder="Enter your password"
        required
      />
      {errors.password && <small className="error-message">{errors.password}</small>}
    </div>
    <div className="form-group">
      <label htmlFor="password">Confirm Pass</label>
      <input
        type="password"
        id="confirmPassword"
        name="confirmPassword"
        value={formData.confirmPassword}
        onChange={handleInputChange}
        // placeholder="Enter your password"
        required
      />
      {errors.confirmPassword && <small className="error-message">{errors.confirmPassword}</small>}
    </div>
  </div>

  {/* Tercera fila: Phone */}
  <div className="form-group">
    <label htmlFor="phone">Phone (Optional)</label>
    <input
      type="text"
      id="phone"
      name="phone"
      value={formData.phone}
      onChange={handleInputChange}
      // placeholder="Enter your phone number"
    />
      </div>

        {/* Botones */}
         <div>
         <button 
   
  className="create-btn" 
  disabled={isLoading || Object.keys(errors).length > 0 || !formData.password || !formData.confirmPassword}
>
  Create
</button>
<button className="cancel-btn" onClick={handleCancel} >
              Cancelar
            </button>

          
          
          </div>
          
         
          </form>
           <div className='google-login'>
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
            

        </div>
      )}
    </div>
  );
};

export default Register;


