import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { getShows, disableShow } from '../../Redux/Actions/actions';
import { useNavigate } from 'react-router-dom';
import Swal from 'sweetalert2';
import './estilospaneladm.css';

const Events = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  
  const shows = useSelector((state) => state.shows);
  const loading = useSelector((state) => state.loading);
  const error = useSelector((state) => state.error);

  const [search, setSearch] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

  useEffect(() => {
    dispatch(getShows());
  }, [dispatch]);

  const handleEdit = (showId) => {
    navigate(`/admin/events/edit/${showId}`);
  };

  const handleToggleState = (showId, state) => {
    const action = state ? 'desactivar' : 'activar';
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
        dispatch(disableShow(showId))
          .then(() => {
            Swal.fire('Estado cambiado!', `El show ha sido ${action} correctamente.`, 'success');
          })
          .catch(() => {
            Swal.fire('Error!', 'Hubo un error al intentar cambiar el estado del show.', 'error');
          });
      }
    });
  };

  // Filtrar los shows por búsqueda
  const filteredShows = shows.filter((show) =>
    show.name.toLowerCase().includes(search.toLowerCase())
  );

  // Paginación
  const totalPages = Math.ceil(filteredShows.length / itemsPerPage);
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentShows = filteredShows.slice(indexOfFirstItem, indexOfLastItem);

  return (
    <div className="events-page">
      <h1>Administrador de eventos</h1>
      {loading && <p>Cargando...</p>}
      {error && <p>Error: {error}</p>}

      <button className='botoncreate' onClick={() => navigate('/create-show')}>Crear evento</button>

      <input
        type="text"
        placeholder="Buscar evento..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        style={{ margin: '10px 0', padding: '8px', width: '100%' }}
      />

      <table className='Titles-tables'>
        <thead>
          <tr>
            <th>Nombre</th>
            <th>Genero</th>
            <th>Acciones</th>
          </tr>
        </thead>
        <tbody>
          {currentShows.map((show) => (
            <tr key={show.id}>
              <td>{show.name}</td>
              <td>{show.genre.join(', ')}</td>
              <td>
                <button className="botonedit" onClick={() => handleEdit(show.id)}>Editar</button>
                <button
                  className={`botonedit-desactivated ${show.state ? 'active' : 'inactive'}`}
                  onClick={() => handleToggleState(show.id, show.state)}
                >
                  {show.state ? 'Desactivar' : 'Activar'}
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* Paginación */}
      <div style={{ marginTop: '20px', display: 'flex', justifyContent: 'center' }}>
        <button 
          onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
          disabled={currentPage === 1}
          style={{ margin: '0 5px', padding: '8px 12px', backgroundColor: '#FFE57F', color: 'black', border: 'none', cursor: currentPage === 1 ? 'not-allowed' : 'pointer',
          borderRadius: '12px'
           }}
        >
          ◀ Anterior
        </button>
        {Array.from({ length: totalPages }).map((_, index) => (
          <button 
            key={index} 
            onClick={() => setCurrentPage(index + 1)}
            style={{ 
              margin: '0 5px', 
              padding: '8px 12px', 
              backgroundColor: currentPage === index + 1 ? '#FFE57F' : '#FFD166', 
              color: 'black', 
              border: 'none', 
              cursor: 'pointer',
              borderRadius: '16px' 
            }}
          >
            {index + 1}
          </button>
        ))}
        <button 
          onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
          disabled={currentPage === totalPages}
          style={{ margin: '0 5px', padding: '8px 12px', backgroundColor: '#FFE57F', color: 'black', border: 'none', cursor: currentPage === totalPages ? 'not-allowed' : 'pointer',
          borderRadius: '12px',
           }}
        >
          Siguiente ▶
        </button>
      </div>
    </div>
  );
};

export default Events;