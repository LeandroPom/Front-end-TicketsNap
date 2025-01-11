import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { getShows } from '../../Redux/Actions/actions'; // Asegúrate de que tienes la acción deleteShow importada
import { useNavigate } from 'react-router-dom';
import './estilospaneladm.css';

const Events = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
 
  const shows = useSelector((state) => state.shows); // Arreglo de shows
  const loading = useSelector((state) => state.loading); // Indicador de carga
  const error = useSelector((state) => state.error); // Errores

  useEffect(() => {
    dispatch(getShows()); // Obtén todos los shows al cargar el componente
  }, [dispatch]);

  const handleEdit = (showId) => {
    // Corrige la ruta para editar el show usando el `showId`
    navigate(`/admin/events/edit/${showId}`);
  };

  const handleDelete = (showId) => {
    // Pregunta al usuario si está seguro de eliminar el evento
    if (window.confirm('¿Seguro que deseas eliminar este evento?')) {
      dispatch(deleteShow(showId)); // Elimina el evento usando la acción deleteShow
    }
  };

  return (
    <div className="events-page">
      <h1>Events Management</h1>
      {loading && <p>Loading...</p>}
      {error && <p>Error: {error}</p>}
      <button onClick={() => navigate('/admin/events/create')}>Create Event</button>
      <table>
        <thead>
          <tr>
            <th>Name</th>
            <th>Genre</th>
            <th>Place</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {shows.map((show) => (
            <tr key={show.id}>
              <td>{show.name}</td>
              <td>{show.genre.join(', ')}</td>
              <td>{show.location.name}</td>
              <td>
                <button className='botonedit' onClick={() => handleEdit(show.id)}>Edit</button>
                <button className='botonedit' onClick={() => handleDelete(show.id)}>Delete</button> {/* Cambié "Deleted" por "Delete" */}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default Events;
