import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { getShows, disableShow } from '../../Redux/Actions/actions'; // Usa la acción disableShow
import { useNavigate } from 'react-router-dom';
import Swal from 'sweetalert2'; // Importar SweetAlert2
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
    navigate(`/admin/events/edit/${showId}`);
  };

  // Función para manejar la desactivación o activación con SweetAlert2
  const handleToggleState = (showId, state) => {
    const action = state ? 'desactivar' : 'activar'; // Determina la acción según el estado actual
    const confirmationMessage = state
      ? '¿Estás seguro de que deseas desactivar este show?'
      : '¿Estás seguro de que deseas activar este show?';

    Swal.fire({
      title: '¿Estás seguro?',
      text: confirmationMessage,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      cancelButtonColor: '#3085d6',
      confirmButtonText: 'Sí, cambiar estado',
      cancelButtonText: 'Cancelar',
    }).then((result) => {
      if (result.isConfirmed) {
        // Si el usuario confirma, despachamos la acción
        dispatch(disableShow(showId))
          .then(() => {
            Swal.fire(
              'Estado cambiado!',
              `El show ha sido ${action} correctamente.`,
              'success'
            );
          })
          .catch((error) => {
            Swal.fire(
              'Error!',
              `Hubo un error al intentar cambiar el estado del show.`,
              'error'
            );
          });
      }
    });
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
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {shows.map((show) => (
            <tr key={show.id}>
              <td>{show.name}</td>
              <td>{show.genre.join(', ')}</td>
              <td>
                <button className="botonedit" onClick={() => handleEdit(show.id)}>Edit</button>
                {/* Botón para cambiar el estado con SweetAlert */}
                <button
                  className={`botonedit ${show.state ? 'active' : 'inactive'}`}
                  onClick={() => handleToggleState(show.id)}
                >
                  {show.state ? 'Desactivar' : 'Activar'}
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default Events;
