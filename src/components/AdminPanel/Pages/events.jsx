import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { getShows,  } from '../../Redux/Actions/actions';
import { useNavigate } from 'react-router-dom';
import './estilospaneladm.css';

const Events = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { shows, loading, error } = useSelector((state) => state);
  const [selectedEvent, setSelectedEvent] = useState(null);

  useEffect(() => {
    dispatch(getShows());
  }, [dispatch]);

  const handleEdit = (eventId) => {
    navigate(`/admin/events/edit/${eventId}`);
  };

  const handleDelete = (eventId) => {
    if (window.confirm('¿Seguro que deseas eliminar este evento?')) {
      dispatch(deleteShow(eventId));
    }
  };

  return (
    <div className="events-page">
      <h1>Gestión de Eventos</h1>
      {loading && <p>Cargando...</p>}
      {error && <p>Error: {error}</p>}
      <button onClick={() => navigate('/admin/events/create')}>Crear Evento</button>
      <table>
        <thead>
          <tr>
            <th>Nombre</th>
            <th>Género</th>
            <th>Ubicación</th>
            <th>Acciones</th>
          </tr>
        </thead>
        <tbody>
          {shows.map((show) => (
            <tr key={show.id}>
              <td>{show.name}</td>
              <td>{show.genre.join(', ')}</td>
              <td>{show.location.name}</td>
              <td>
                <button onClick={() => handleEdit(show.id)}>Editar</button>
                <button onClick={() => handleDelete(show.id)}>Eliminar</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default Events;
