// Tipos de acciones
export const SET_EVENTS = 'SET_EVENTS';
export const ADD_EVENT = 'ADD_EVENT';

// Acción para establecer una lista de eventos
export const setEvents = (events) => ({
  type: SET_EVENTS,
  payload: events,
});

// Acción para agregar un evento
export const addEvent = (event) => ({
  type: ADD_EVENT,
  payload: event,
});
