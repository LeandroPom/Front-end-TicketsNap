// src/store/index.js
import { createStore, applyMiddleware } from 'redux'; // Importar applyMiddleware para agregar middleware
import thunk from 'redux-thunk'; // Importar redux-thunk
import rootReducer from "../../Redux/Reducer/reducer";

const store = createStore(
  rootReducer, // rootReducer contiene todos los reducers
  applyMiddleware(thunk), // Agregar redux-thunk como middleware
  window.__REDUX_DEVTOOLS_EXTENSION__ && window.__REDUX_DEVTOOLS_EXTENSION__() // Para la extensión de Redux DevTools en el navegador
);

export default store;
