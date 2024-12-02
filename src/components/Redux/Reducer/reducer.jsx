// src/reducers/userReducer.js
import { 
  CREATE_USER_SUCCESS,
  CREATE_USER_FAIL,
  LOGIN_REQUEST,
  LOGIN_SUCCESS,
  LOGIN_FAILURE,
  LOGOUT,
  CREATE_SHOW_SUCCESS,
  CREATE_SHOW_FAIL,
  FETCH_SHOWS_SUCCESS,
  FETCH_SHOWS_ERROR,
  FETCH_SHOWS_LOADING,
  CREATE_TAG_SUCCESS,
  CREATE_TAG_FAIL,
  FETCH_TAGS_SUCCESS,
  FETCH_TAGS_ERROR,
  FETCH_TAGS_LOADING

} from '../Actions/actions'; // Importa las acciones

// Estado inicial
const initialState = {
  tags: [],           // LISTA DE TAGS
  shows: [],         // Lista de shows existentes
  user: null,        // Datos del usuario recién creado o autenticado
  loading: false,    // Indicador de carga
  error: null,       // Errores si los hay
};

// Reducer para manejar las acciones de usuario
const rootReducer = (state = initialState, action) => {
  switch (action.type) {
    // Caso de creación de usuario
    case CREATE_USER_SUCCESS:
      return {
        ...state,
        user: action.payload,   // Guardamos el usuario en el estado
        loading: false,         // La carga ha terminado
        error: null,            // Sin errores
      };

    case CREATE_USER_FAIL:
      return {
        ...state,
        user: null,             // No hay usuario porque falló la creación
        loading: false,         // La carga ha terminado
        error: action.payload,  // Mostramos el error
      };

    // Casos de login
    case LOGIN_REQUEST:
      return {
        ...state,
        loading: true,          // Indicador de carga activado
        error: null,            // Reiniciamos el error
      };

    case LOGIN_SUCCESS:
      return {
        ...state,
        user: action.payload,   // Guardamos los datos del usuario autenticado
        loading: false,         // La carga ha terminado
        error: null,            // Sin errores
      };

    case LOGIN_FAILURE:
      return {
        ...state,
        user: null,             // No autenticamos usuario
        loading: false,         // La carga ha terminado
        error: action.payload,  // Guardamos el error
      };


      case LOGOUT:
        return {
          ...state,
          user: null,  // Limpiamos el usuario al hacer logout
          loading: false,
          error: null,
        };

        case CREATE_SHOW_SUCCESS:
      return {
        ...state,
        shows: [...state.shows, action.payload], // Agrega el nuevo show al estado
        error: null,
      };

    case CREATE_SHOW_FAIL:
      return {
        ...state,
        error: action.payload, // Guarda el mensaje de error en el estado
      };

      case FETCH_SHOWS_SUCCESS:
        console.log('Shows received in reducer:', action.payload);
  return {
    ...state,
    shows: action.payload, // Asegúrate de que "action.payload" sea un array de shows
    
    loading: false,
   
  };
    case FETCH_SHOWS_ERROR:
      return {
        ...state,
        error: action.payload,
        loading: false,
      };
    case FETCH_SHOWS_LOADING:
      return {
        ...state,
        loading: true,
      };

      case CREATE_TAG_SUCCESS:
        return {
          ...state,
          tags: [...state.tags, action.payload],  // Agregar el nuevo tag a la lista de tags
          loading: false,
          error: null,
        };
  
      case CREATE_TAG_FAIL:
        return {
          ...state,
          loading: false,
          error: action.payload,  // Manejamos el error al crear un tag
        };
  
      // Caso para obtener los tags
      case FETCH_TAGS_SUCCESS:
        console.log('Tags received in reducer:', action.payload);  // Verifica los datos en el reducer
        return {
          ...state,
          tags: action.payload,  // Aquí estamos actualizando el estado de tags con el payload recibido
        };
  
      case FETCH_TAGS_ERROR:
        return {
          ...state,
          error: action.payload,  // Manejamos el error al obtener los tags
        };

        case FETCH_TAGS_LOADING:
      return {
        ...state,
        loading: true,
      };
   
   

    default:
      return state;
  }


};

export default rootReducer;
