// src/reducers/index.js
import { combineReducers } from 'redux';
import eventReducer from '../Reducer/'; // Asegúrate de que la ruta sea correcta

const rootReducer = combineReducers({
  event: eventReducer,
});

export default rootReducer;
