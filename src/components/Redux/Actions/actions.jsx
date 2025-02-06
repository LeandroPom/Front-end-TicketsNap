
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
export const CREATE_PLACE_SUCCESS="CREATE_PLACE_SUCCESS";
export const CREATE_PLACE_FAILURE="CREATE_PLACE_FAILURE";
export const GET_PLACES_SUCCESS="GET_PLACES_SUCCESS"
export const GET_PLACES_REQUEST="GET_PLACES_REQUEST"
export const GET_PLACES_FAILURE="GET_PLACES_FAILURE"
export const SHOW_REQUEST="SHOW_REQUEST"
export const SHOW_SUCCESS="SHOW_SUCCES"
export const SHOW_FAILURE="SHOW_FAILURE"
export const UPDATE_SHOW_SUCCESS="UPDATE_SHOW_SUCCESS"
export const DISABLE_SHOW="DISABLE_SHOW"

const BASE_URL = 'http://localhost:3001';  // Asegúrate de que esta URL corresponda a tu backend

// Acción para crear un usuario
export const createUser = (userData) => async (dispatch) => {
  try {
    // Hacemos el POST a la API del backend para crear el usuario
    const response = await axios.post(`/users`, userData);
    
    // Despachamos la acción de éxito
    dispatch({
      type: CREATE_USER_SUCCESS,
      payload: response.data.user,
    });

    
  } catch (error) {
    // Despachamos la acción de fallo
    dispatch({
      type: CREATE_USER_FAIL,
      payload: error.response ? error.response.data.error : error.message,
    });

    
  }
};

// Acción para el login manual
// export const loginUser = (email, password) => async (dispatch) => {
//   dispatch({ type: LOGIN_REQUEST });

//   try {
//     const response = await axios.get('/users', {
//       params: { email }, // Filtramos por email
//     });

//     const user = response.data?.data?.find((user) => user.email === email && user.password === password);

//     if (user) {
//       if (user.disabled) {
//         // Usuario bloqueado
//         dispatch({
//           type: LOGIN_FAILURE,
//           payload: 'Tu cuenta ha sido deshabilitada.',
//         });
//         return { error: 'Usuario bloqueado' }; // Retornar error explícito
//       }

//       dispatch({
//         type: LOGIN_SUCCESS,
//         payload: user, // Usuario válido
//       });

//       return user; // Retornar el usuario encontrado
//     } else {
//       dispatch({
//         type: LOGIN_FAILURE,
//         payload: 'Usuario o contraseña incorrectos.',
//       });
//       return { error: 'Credenciales incorrectas' }; // Retornar error explícito
//     }
//   } catch (error) {
//     dispatch({
//       type: LOGIN_FAILURE,
//       payload: 'Error al realizar el login.',
//     });
//     return { error: 'Error en el servidor' }; // Error general
//   }
// };




export const login = (email, password) => async (dispatch) => {
  dispatch({ type: LOGIN_REQUEST });

  try {
    const response = await axios.post('users/login', {
      mail: email,
      password: password,  // Enviamos la contraseña en texto claro
    });

    const user = response.data?.user;

    if (user) {
      if (user.disabled) {
        // Usuario bloqueado
        dispatch({
          type: LOGIN_FAILURE,
          payload: 'Tu cuenta ha sido deshabilitada.',
        });
        return { error: 'Usuario bloqueado' }; // Retornar error explícito
      }

      dispatch({
        type: LOGIN_SUCCESS,
        payload: user, // Usuario válido
      });

      return user; // Retornar el usuario encontrado
    } else {
      dispatch({
        type: LOGIN_FAILURE,
        payload: 'Usuario o contraseña incorrectos.',
      });
      return { error: 'Credenciales incorrectas' }; // Retornar error explícito
    }
  } catch (error) {
    dispatch({
      type: LOGIN_FAILURE,
      payload: 'Error al realizar el login.',
    });
    return { error: 'Error en el servidor' }; // Error general
  }
};




// Acción para el login con Google
export const loginWithGoogle = (email) => async (dispatch) => {
  dispatch({ type: LOGIN_REQUEST });

  try {
    // Realizamos una búsqueda en la base de datos local por email
    const response = await axios.get('/users', {
      params: { email }, // Filtramos por email
    });

    // Verificamos si existe un usuario con el email proporcionado
    const user = response.data?.data?.find((user) => user.email === email);

    if (user) {
      // Verificamos si el usuario está deshabilitado
      if (user.disabled) {
        dispatch({
          type: LOGIN_FAILURE,
          payload: 'Tu cuenta ha sido deshabilitada. Por favor, contacta al soporte.',
        });
        return { error: 'Usuario bloqueado' }; // Retornamos error si está bloqueado
      }

      // Si encontramos un usuario con el email correcto y no está bloqueado
      dispatch({
        type: LOGIN_SUCCESS,
        payload: user, // Guardamos el usuario encontrado en Redux
      });

      return user; // Retornamos el usuario encontrado
    } else {
      // Si no hay coincidencia de email
      throw new Error('Usuario no registrado en la base de datos local');
    }
  } catch (error) {
    dispatch({
      type: LOGIN_FAILURE,
      payload: error.message || 'Error al verificar usuario con Google',
    });
    throw error; // Re-lanzamos el error para manejarlo en el componente
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
    const response = await axios.post("/shows", showData);

    // Si la respuesta es exitosa, despacha la acción
    dispatch({
      type: CREATE_SHOW_SUCCESS,
      payload: response.data, // El show creado
    });

    
  } catch (error) {
    // Si ocurre un error, despacha la acción de fallo
    dispatch({
      type: CREATE_SHOW_FAIL,
      payload: error.response?.data?.message || 'Error creating the show',
    });

    
  }
};

//TRAER TODOS LOS SHOWS ////

export const getShows = () => async (dispatch) => {
  try {
    // Enviar la solicitud GET a la API
    const response = await axios.get('/shows');
    dispatch({ type: FETCH_SHOWS_LOADING }); // Enviamos el estado de carga antes de hacer la solicitud

    // Verificamos cómo llega la data para asegurarnos de que es un array
   

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

///OBTENER SHOWS PIR ID /////

export const getShowById = (showId) => async (dispatch) => {
  try {
    dispatch({ type: 'SHOW_REQUEST' });
    const response = await axios.get(`/shows/${showId}`);
    dispatch({ type: 'SHOW_SUCCESS', payload: response.data });
  } catch (error) {
    dispatch({ type: 'SHOW_FAILURE', payload: error.message });
  }
};


////ACTUALIZAR SHOWS POR ID ///

export const updateShow = (id, updates) => async (dispatch) => {
  try {
    // Crear el objeto con las actualizaciones (sin el ID aquí)
    const data = updates;

    // Enviar la solicitud PUT al backend con el ID en la URL
    const response = await axios.put(`/shows/edit/${id}`, data);

    dispatch({
      type: 'UPDATE_SHOW',
      payload: response.data,  // O lo que devuelva tu API, por ejemplo, el show actualizado
    });
    

    return response.data; // Retornar la respuesta para esperar en el componente
  } catch (error) {
    console.error('Error al actualizar el evento:', error);
    dispatch({
      type: 'UPDATE_SHOW_ERROR',
      payload: error.message,
    });
    throw error; // Lanzamos el error para manejarlo en el componente
  }
};

/// BORRADO LOGICO AL SHOW ////////////

export const disableShow = (showId) => async (dispatch) => {
  try {
    // Realizar la solicitud DELETE al backend para desactivar el show
    const response = await axios.delete(`/shows/disable/${showId}`);
    
    // Si la operación es exitosa, se puede actualizar el estado en Redux
    dispatch({
      type: 'DISABLE_SHOW', // Acción para indicar que el show fue desactivado
      payload: response.data,
    });
    
    // Retornar el mensaje de éxito
    return response.data;
  } catch (error) {
    console.error('Error al desactivar el show:', error);
    
    // Enviar error si ocurre alguno
    dispatch({
      type: 'SHOW_ERROR',
      payload: error.message,
    });
    
    throw error;
  }
};

// Acción para crear un nuevo tag (género)
export const createTag = (name) => async (dispatch) => {
  try {
    const response = await axios.post('/tags', { name }); // Enviar la solicitud POST al backend
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
    const response = await axios.get('/tags');
    

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

///CREAR UN LUGAR /////

export const createPlace = (placeData) => async (dispatch) => {
  try {
    // Enviar la solicitud POST para crear el lugar
    const response = await axios.post('/places', placeData);

    dispatch({
      type: 'CREATE_PLACE_SUCCESS',
      payload: response.data, // Datos del lugar creado
    });
    
    // Puedes mostrar un mensaje o redirigir según sea necesario
  } catch (error) {
    dispatch({
      type: 'CREATE_PLACE_FAILURE',
      payload: error.response ? error.response.data : error.message,
    });
  }
};

/// TRAER LUGARES ///

export const getPlaces = () => async (dispatch) => {
  dispatch({ type: 'GET_PLACES_REQUEST' });

  try {
    const response = await axios.get('/places');  // Cambia la URL a la correcta de tu backend
    dispatch({
      type: 'GET_PLACES_SUCCESS',
      payload: response.data,
    });
  } catch (error) {
    dispatch({
      type: 'GET_PLACES_FAILURE',
      payload: error.message,
    });
  }
};



