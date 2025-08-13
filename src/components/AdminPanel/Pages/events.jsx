import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { getShows, disableShow, deleteShow } from '../../Redux/Actions/actions';
import { useNavigate } from 'react-router-dom';
import Swal from 'sweetalert2';


const Events = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  
  const shows = useSelector((state) => state.shows);
  const loading = useSelector((state) => state.loading);
  const error = useSelector((state) => state.error);

  const [search, setSearch] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;
console.log(shows, "datos del show")

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

/// funcion para eliminacion de los shows y sus tickets //////

  const handleDeleteShow = (showId) => {
  // Primer alerta de advertencia
  Swal.fire({
    title: '¡Cuidado!',
    text: 'Esta acción eliminará toda la información del show, incluyendo los tickets.',
    icon: 'warning',
    showCancelButton: true,
    confirmButtonText: 'Continuar',
    cancelButtonText: 'Cancelar',
    confirmButtonColor: '#d33',
    cancelButtonColor: '#3085d6',
  }).then((result) => {
    if (result.isConfirmed) {
      let timerInterval;
      Swal.fire({
        title: '¿Estás completamente seguro?',
        html: 'Esta acción es permanente. Eliminando en <b>10</b> segundos...',
        timer: 5000,
        timerProgressBar: true,
        showCancelButton: true,
        cancelButtonText: 'Arrepentirse',
        confirmButtonText: 'Eliminar ahora',
        confirmButtonColor: '#d33',
        cancelButtonColor: '#3085d6',
        didOpen: () => {
          const content = Swal.getHtmlContainer();
          const b = content.querySelector('b');
          timerInterval = setInterval(() => {
            b.textContent = Math.ceil(Swal.getTimerLeft() / 1000);
          }, 1000);
        },
        willClose: () => {
          clearInterval(timerInterval);
        }
      }).then((secondResult) => {
        // Si el usuario no cancela y la cuenta regresiva llega a 0 o hace clic en "Eliminar ahora"
        if (secondResult.dismiss === Swal.DismissReason.timer || secondResult.isConfirmed) {
          dispatch(deleteShow(showId))
            .then(() => {
              Swal.fire('¡Eliminado!', 'El show ha sido eliminado permanentemente.', 'success');
            })
            .catch(() => {
              Swal.fire('Error', 'No se pudo eliminar el show.', 'error');
            });
        } else {
          Swal.fire('Cancelado', 'La eliminación fue cancelada.', 'info');
        }
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
   <div className="w-full flex justify-center mt-28">
    <div
  className="
    min-h-screen p-4 md:p-6
    w-full max-w-screen-xl
    mx-auto
    relative
    top-[170px]
    z-10
  "
  style={{
    background: "rgba(86, 86, 190, 0.4)",
    backdropFilter: "blur(10px)",
    WebkitBackdropFilter: "blur(10px)",
  }}
>
      <h1 className="text-3xl font-bold mb-6 text-center">Administrador de eventos</h1>

      {loading && <p className="text-yellow-300 mb-4">Cargando...</p>}
      {error && <p className="text-red-400 mb-4">Error: {error}</p>}

      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center mb-6 gap-4">
        <button
          className="bg-[rgb(90,90,170)] hover:bg-[rgb(110,110,190)] transition text-white font-bold py-2 px-4 rounded"
          onClick={() => navigate('/create-show')}
        >
          Crear evento
        </button>

        <input
          type="text"
          placeholder="Buscar evento..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full sm:w-1/2 p-2 rounded bg-[rgb(90,90,170)] text-white border border-white"
        />
      </div>

      <div className="overflow-x-auto">
        <table className="min-w-full text-left border border-white">
          <thead className="bg-[rgb(70,70,140)]">
            <tr>
              <th className="text-gray-400 p-3 border-b border-white">Nombre</th>
              <th className="text-gray-400 p-3 border-b border-white">Género</th>
              <th className="text-gray-400 p-3 border-b border-white text-center">Acciones</th>
            </tr>
          </thead>
          <tbody>
            {currentShows.map((show) => (
              <tr key={show.id} className="hover:bg-[rgb(60,60,120)] transition">
                <td className="p-3 border-b border-white">{show.name}</td>
                <td className="p-3 border-b border-white">{show.genre.join(', ')}</td>
                <td className="p-3 border-b border-white">
                  <div className="flex flex-col sm:flex-row justify-center items-center gap-2">
                    <button
                      className="bg-[rgb(90,90,170)] hover:bg-[rgb(110,110,190)] text-white font-bold py-1 px-3 rounded"
                      onClick={() => handleEdit(show.id)}
                    >
                      Editar
                    </button>
                    <button
                      className={`${
                        show.state
                          ? 'bg-[rgb(90,90,170)] hover:bg-[rgb(110,110,190)]'
                          : 'bg-[rgb(90,90,170)] hover:bg-[rgb(110,110,190)]'
                      } text-white font-bold py-1 px-3 rounded`}
                      onClick={() => handleToggleState(show.id, show.state)}
                    >
                      {show.state ? 'Desactivar' : 'Activar'}
                    </button>
                    <button
                      className="bg-[rgb(90,90,170)] hover:bg-[rgb(110,110,190)] text-white font-bold py-1 px-3 rounded"
                      onClick={() => handleDeleteShow(show.id)}
                    >
                      Eliminar
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Paginación */}
      <div className="mt-6 flex flex-wrap justify-center gap-2">
        <button
          onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
          disabled={currentPage === 1}
          className={`px-4 py-2 rounded-full ${
            currentPage === 1 ? 'bg-gray-400 cursor-not-allowed' : 'bg-blue-900 hover:bg-blue-800'
          }`}
        >
          ◀ Anterior
        </button>

        {Array.from({ length: totalPages }).map((_, index) => (
          <button
            key={index}
            onClick={() => setCurrentPage(index + 1)}
            className={`px-4 py-2 rounded-full font-bold ${
              currentPage === index + 1 ? 'bg-blue-900' : 'bg-yellow-500 hover:bg-blue-850'
            }`}
          >
            {index + 1}
          </button>
        ))}

        <button
          onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
          disabled={currentPage === totalPages}
          className={`px-4 py-2 rounded-full ${
            currentPage === totalPages ? 'bg-gray-400 cursor-not-allowed' : 'bg-blue-900 hover:bg-blue-850'
          }`}
        >
          Siguiente ▶
        </button>
      </div>
    </div>
  </div>
);

};

export default Events;