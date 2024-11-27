// src/reducers/userReducer.js
import { 
  CREATE_USER_SUCCESS,
  CREATE_USER_FAIL,
  LOGIN_REQUEST,
  LOGIN_SUCCESS,
  LOGIN_FAILURE,
  LOGOUT,
} from '../Actions/actions'; // Importa las acciones

// Estado inicial
const initialState = {
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
   
   

    default:
      return state;
  }
};

export default rootReducer;
