// src/store/index.js
import { createStore } from 'redux';
import rootReducer from "../../Redux/Reducer/indexreducer";

const store = createStore(
  rootReducer, // rootReducer contiene todos los reducers
  window.__REDUX_DEVTOOLS_EXTENSION__ && window.__REDUX_DEVTOOLS_EXTENSION__() // Para la extensión de Redux DevTools en el navegador
);

export default store;
