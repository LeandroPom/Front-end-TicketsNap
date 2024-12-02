
// src/actions/userActions.js

import axios from 'axios';

export const CREATE_USER_SUCCESS = 'CREATE_USER_SUCCESS';
export const CREATE_USER_FAIL = 'CREATE_USER_FAIL';
export const LOGIN_REQUEST = 'LOGIN_REQUEST';
export const LOGIN_SUCCESS = 'LOGIN_SUCCESS';
export const LOGIN_FAILURE = 'LOGIN_FAILURE';
export const LOGOUT = 'LOGOUT';
export const CREATE_SHOW_SUCCESS = 'CREATE_SHOW_SUCCESS';
export const CREATE_SHOW_FAIL = 'CREATE_SHOW_FAIL';
export const FETCH_SHOWS_SUCCESS='FETCH_SHOWS_SUCCESS'
export const FETCH_SHOWS_ERROR='FETCH_SHOWS_ERROR'
export const FETCH_SHOWS_LOADING = 'FETCH_SHOWS_LOADING';
export const CREATE_TAG_SUCCESS="CREATE_TAG_SUCCESS";
export const CREATE_TAG_FAIL="CREATE_TAG_FAIL";
export const FETCH_TAGS_SUCCESS="FETCH_TAGS_SUCCESS";
export const FETCH_TAGS_ERROR="FETCH_TAGS_ERROR";
export const FETCH_TAGS_LOADING="FETCH_TAGS_LOADING";

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
    // Realizamos una búsqueda por email
    const response = await axios.get('http://localhost:3001/users', {
      params: { email }, // Filtramos por email
    });

    // Verificamos si hay usuarios que coinciden con el email
    const user = response.data.find((user) => user.email === email && user.password === password);

    if (user) {
      // Si encontramos un usuario con el email y la contraseña correctos
      dispatch({
        type: LOGIN_SUCCESS,
        payload: user, // Guardamos el usuario encontrado
      });
    } else {
      // Si no hay coincidencia de email o contraseña
      dispatch({
        type: LOGIN_FAILURE,
        payload: 'Usuario o contraseña incorrectos',
      });
    }

  } catch (error) {
    // Manejo de errores de la API
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

// Acción para crear un show
export const createShow = (showData) => async (dispatch) => {
  try {
    // Petición POST al backend
    const response = await axios.post("http://localhost:3001/shows", showData);

    // Si la respuesta es exitosa, despacha la acción
    dispatch({
      type: CREATE_SHOW_SUCCESS,
      payload: response.data, // El show creado
    });

    alert('Show created successfully!');
  } catch (error) {
    // Si ocurre un error, despacha la acción de fallo
    dispatch({
      type: CREATE_SHOW_FAIL,
      payload: error.response?.data?.message || 'Error creating the show',
    });

    alert(`Error: ${error.response?.data?.message || error.message}`);
  }
};

//TRAER TODOS LOS SHOWS ////

export const getShows = () => async (dispatch) => {
  try {
    // Enviar la solicitud GET a la API
    const response = await axios.get('http://localhost:3001/shows');
    dispatch({ type: FETCH_SHOWS_LOADING }); // Enviamos el estado de carga antes de hacer la solicitud

    // Verificamos cómo llega la data para asegurarnos de que es un array
    console.log('Shows received:', response.data);

    // Asegurarnos de que los shows sean un array de objetos
    const shows = Array.isArray(response.data) 
      ? response.data // Si la respuesta ya es un array de objetos
      : [response.data]; // Si es un solo objeto, lo envolvemos en un array

    // Despachar la acción con los datos de los shows
    dispatch({
      type: FETCH_SHOWS_SUCCESS,
      payload: shows, // Asegúrate de enviar el array de shows
    });
  } catch (error) {
    // Si ocurre un error, despachar la acción de error
    dispatch({
      type: FETCH_SHOWS_ERROR,
      payload: error.message,
    });
  }

};

// Acción para crear un nuevo tag (género)
export const createTag = (name) => async (dispatch) => {
  try {
    const response = await axios.post('http://localhost:3001/tags', { name }); // Enviar la solicitud POST al backend
    dispatch({
      type: 'CREATE_TAG_SUCCESS',
      payload: response.data,  // Devuelve los datos del tag creado
    });
  } catch (error) {
    dispatch({
      type: 'CREATE_TAG_FAIL',
      payload: error.response?.data?.error || 'Error al crear el género',  // Manejamos el error
    });
  }
};

// Acción para obtener todos los tags
export const getTags = () => async (dispatch) => {
  try {
    dispatch({ type: 'FETCH_TAGS_LOADING' }); // Acción para indicar que estamos cargando los tags

    // Hacemos la solicitud GET a la API para obtener los tags
    const response = await axios.get('http://localhost:3001/tags');
    console.log('Tags received:', response.data);

    // Asegúrate de que la respuesta sea un array de tags
    const tags = Array.isArray(response.data) ? response.data : [response.data]; // Manejo de respuesta

    // Despachamos la acción con los tags obtenidos
    dispatch({
      type: 'FETCH_TAGS_SUCCESS',
      payload: tags,  // La lista de tags que serán guardados en el estado
    });
  } catch (error) {
    dispatch({
      type: 'FETCH_TAGS_ERROR',
      payload: error.response?.data?.error || 'Error al obtener los géneros',  // Error en la solicitud
    });
  }
};



