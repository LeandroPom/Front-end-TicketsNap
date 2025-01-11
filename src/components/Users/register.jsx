import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom'; // Agregamos useNavigate para redirigir
import './register.css'; 
import { GoogleOAuthProvider, GoogleLogin } from '@react-oauth/google';
import { GoogleAuthProvider, signInWithCredential } from 'firebase/auth';
import { useDispatch } from 'react-redux';
import { createUser } from '../Redux/Actions/actions';
import { auth } from '../Firebase/firebase.config'; 
import Swal from 'sweetalert2'; // Importamos SweetAlert2

const Register = () => {
  const [isModalOpen, setIsModalOpen] = useState(true);
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    phone: '',
    image: '',
  });
  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const dispatch = useDispatch();
  const navigate = useNavigate(); // Usamos el hook de navegación para redirigir

  const clientId = '220270807051-k0j1nanf7am7do9garnpb5c4u4lmmd8p.apps.googleusercontent.com';

  const handleCloseModal = () => {
    setIsModalOpen(false);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prevData) => ({
      ...prevData,
      [name]: value,
    }));
  };

  const validateForm = () => {
    const newErrors = {};
    if (!formData.firstName) newErrors.firstName = "First name is required.";
    if (!formData.lastName) newErrors.lastName = "Last name is required.";
    if (!formData.email || !/\S+@\S+\.\S+/.test(formData.email))
      newErrors.email = "Please enter a valid email address.";
    if (!formData.password || formData.password.length < 6)
      newErrors.password = "Password must be at least 6 characters long.";
    if (!/\d/.test(formData.password) || !/[A-Za-z]/.test(formData.password))
      newErrors.password = "Password must contain at least one letter and one number.";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (validateForm()) {
      setIsLoading(true);
      try {
        const userData = {
          name: `${formData.firstName} ${formData.lastName}`,
          email: formData.email,
          password: formData.password,
          image: formData.image,
          role: 'user',
        };

        // Despachar la acción de crear el usuario
        dispatch(createUser(userData));

        // Mostrar SweetAlert de éxito
        Swal.fire({
          icon: 'success',
          title: 'Registro correcto',
          text: 'Bienvenido, tu cuenta ha sido creada con éxito.',
        }).then(() => {
          // Cerrar el modal y redirigir a la página de inicio
          setIsModalOpen(false);
          navigate('/');
        });

        // Limpiar el formulario
        setFormData({
          firstName: '',
          lastName: '',
          email: '',
          password: '',
          phone: '',
          image: '',
        });
      } catch (error) {
        console.error("Error registering user:", error.message);
        setErrors({ email: "Error al registrar el usuario, intenta de nuevo." });
      } finally {
        setIsLoading(false);
      }
    }
  };

  const handleGoogleRegister = async (response) => {
    const provider = new GoogleAuthProvider();
    try {
      const credential = GoogleAuthProvider.credential(response.credential);
      const userCredential = await signInWithCredential(auth, credential);

      const user = userCredential.user;
      console.log("Google login success:", user);

      const userData = {
        name: user.displayName,
        email: user.email,
        image: user.photoURL,
        role: 'user',
      };

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
    }
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
      {errors.password && <small>{errors.password}</small>}
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
         <div >
         <button type="submit" className="create-btn" disabled={isLoading}>
          {isLoading ? "Creating..." : "Create"}
          </button>
         <Link to="/" className="cancel-btn">Cancel</Link>
          </div>
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
          </form>

        </div>
      )}
    </div>
  );
};

export default Register;


