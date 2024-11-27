
// src/actions/userActions.js

import axios from 'axios';

export const CREATE_USER_SUCCESS = 'CREATE_USER_SUCCESS';
export const CREATE_USER_FAIL = 'CREATE_USER_FAIL';
export const LOGIN_REQUEST = 'LOGIN_REQUEST';
export const LOGIN_SUCCESS = 'LOGIN_SUCCESS';
export const LOGIN_FAILURE = 'LOGIN_FAILURE';
export const LOGOUT = 'LOGOUT';


const BASE_URL = 'http://localhost:3001';  // Asegúrate de que esta URL corresponda a tu backend

// Acción para crear un usuario
export const createUser = (userData) => async (dispatch) => {
  try {
    // Hacemos el POST a la API del backend para crear el usuario
    const response = await axios.post(`http://localhost:3001/users`, userData);
    
    // Despachamos la acción de éxito
    dispatch({
      type: CREATE_USER_SUCCESS,
      payload: response.data.user,
    });

    alert("User created successfully!");
  } catch (error) {
    // Despachamos la acción de fallo
    dispatch({
      type: CREATE_USER_FAIL,
      payload: error.response ? error.response.data.error : error.message,
    });

    alert("Error: " + (error.response ? error.response.data.error : error.message));
  }
};

// Acción para el login manual
export const loginUser = (email, password) => async (dispatch) => {
  dispatch({ type: LOGIN_REQUEST });

  try {
    // Usamos los parámetros de la URL para enviar el email y el password
    const response = await axios.get('http://localhost:3001/users', {
      params: { email, password } // Pasamos email y password como query params
    });

    // Si el usuario existe en la base de datos, la respuesta debería contenerlo
    if (response.data.length > 0) {
      dispatch({
        type: LOGIN_SUCCESS,
        payload: response.data[0], // En caso de que haya varios usuarios con el mismo email (aunque no debería), tomamos el primero
      });
    } else {
      dispatch({
        type: LOGIN_FAILURE,
        payload: 'Usuario o contraseña incorrectos',
      });
    }

  } catch (error) {
    dispatch({
      type: LOGIN_FAILURE,
      payload: error.response?.data?.message || 'Error al iniciar sesión',
    });
  }
};


export const logoutUser = () => (dispatch) => {
  try {
   

    // Disparar la acción para limpiar el estado global
    dispatch({
      type: 'LOGOUT',
    });
  } catch (error) {
    console.error('Error al hacer logout:', error.message);

    
  }
};



