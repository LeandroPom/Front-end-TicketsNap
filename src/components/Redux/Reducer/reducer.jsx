// src/reducers/eventReducer.js
import { SET_EVENTS, ADD_EVENT } from '../Actions/actions';

// Estado inicial
const initialState = {
  events: [],
};

// Reducer para manejar las acciones
const rootReducer = (state = initialState, action) => {
  switch (action.type) {
    case SET_EVENTS:
     return {
       ...state,
        events: action.payload,
      };

     case ADD_EVENT:
      return {
      ...state,
        events: [...state.events, action.payload],
     };

    default:
      return state;
  }
};

export default rootReducer;
