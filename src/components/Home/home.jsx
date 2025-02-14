import { useSelector, useDispatch } from 'react-redux';
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Calendar from 'react-calendar'; // Importar el calendario
import 'react-calendar/dist/Calendar.css'; // Importar los estilos predeterminados
import { FaSyncAlt } from 'react-icons/fa';
import { getShows } from '../Redux/Actions/actions';
import '../Home/home.css'; // Asegúrate de que el archivo contenga estilos actualizados

import Carousel from './carrousel'; // Importar el carrusel

import { FaCalendarAlt } from 'react-icons/fa'; // Ícono para el botón del calendario

const ShowsList = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const shows = useSelector((state) => state.shows); // Arreglo de shows
  const loading = useSelector((state) => state.loading); // Indicador de carga
  const error = useSelector((state) => state.error); // Errores

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedGenre, setSelectedGenre] = useState('');
  const [filteredShows, setFilteredShows] = useState([]);
  const [selectedDate, setSelectedDate] = useState(null);
  const [showCalendar, setShowCalendar] = useState(false); // Controla si se muestra el calendario
  const [isVideoPlaying, setIsVideoPlaying] = useState(false); // Controlar si un video está activo
  const [currentPage, setCurrentPage] = useState(1); // Página actual
  const [showsPerPage] = useState(3); // Número de shows por página

  useEffect(() => {
    dispatch(getShows());
  }, [dispatch]);

  // Filtrar shows por búsqueda, género y fecha seleccionada
  useEffect(() => {
    const filteredShows = shows.filter((show) => {
      const matchesSearch = show.name.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesGenre = selectedGenre ? show.genre.includes(selectedGenre) : true;
      const matchesDate = selectedDate
        ? show.presentation.some((p) => p.date === selectedDate.toISOString().split('T')[0])
        : true;
        
      
  
        return matchesSearch && matchesGenre && matchesDate && show.state;
      });
      setFilteredShows(filteredShows);
}, [searchQuery, selectedGenre, selectedDate, shows]);

  // Extraer las imágenes de los shows para el carrusel
  const carouselImages = shows.map((show) => show.coverImage).filter(Boolean);

  // Obtener todas las fechas de presentaciones sin paginación
const eventDates = (shows || []).flatMap((show) =>
  show.presentation?.map((p) => p.date) || []
);

  const tileClassName = ({ date, view }) => {
    if (view === 'month') {
      const formattedDate = date.toISOString().split('T')[0];
      if (eventDates.includes(formattedDate)) {
        return 'react-calendar__tile--hasActive'; // Resaltar las fechas con eventos
      }
    }
    return null;
  };

  if (loading) {
    return <div>Loading...</div>;
  }

  if (error) {
    return <div>Error: {error}</div>;
  }

  const handleViewDetails = (show) => {
    if (show.isGeneral) {
      navigate(`/event/general/${show.id}`);
    } else {
      navigate(`/event/${show.id}`);
    }
  };

 // 🔹 PAGINACIÓN: Se aplica después del filtrado
 const indexOfLastShow = currentPage * showsPerPage;
 const indexOfFirstShow = indexOfLastShow - showsPerPage;
 const currentShows = filteredShows.slice(indexOfFirstShow, indexOfLastShow);

// Cálculo de las páginas
const pageNumbers = [];
for (let i = 1; i <= Math.ceil(filteredShows.length / showsPerPage); i++) {
  pageNumbers.push(i);
}


 // Lógica para avanzar 1 páginas
 const nextPage = () => {
  const nextPageNumber = currentPage + 1;
  if (nextPageNumber <= pageNumbers.length) {
    setCurrentPage(nextPageNumber);
  }
};

// Lógica para retroceder 1 páginas
const prevPage = () => {
  const prevPageNumber = currentPage - 1;
  if (prevPageNumber > 0) {
    setCurrentPage(prevPageNumber);
  }
};


 // Lógica para ir a la primera página
  const goToFirstPage = () => {
    setCurrentPage(1);
  };

  // Lógica para ir a la última página
  const goToLastPage = () => {
    setCurrentPage(pageNumbers.length);
  };

// Cambiar la página actual
const paginate = (pageNumber) => setCurrentPage(pageNumber);
  const genres = [...new Set(shows.flatMap((show) => show.genre))];

  // Resetear filtros
  const resetFilters = () => {
    setSearchQuery('');
    setSelectedGenre('');
    setSelectedDate(null);
    setShowCalendar(false);
    setCurrentPage(1); // 🔹 Resetear paginación al aplicar filtros
  };




   // Determinamos si el video está siendo reproducido y pasamos ese estado al carrusel
   const handleVideoPlay = () => {
    setIsVideoPlaying(true); // Un video está siendo reproducido
  };

  const handleVideoPause = () => {
    setIsVideoPlaying(false); // El video se detuvo
  };


  return (
    <div className="home">
      {/* Reemplazar el título por el carrusel */}
      <Carousel images={carouselImages} isVideoPlaying={isVideoPlaying} /> {/* Pasamos el estado al carrusel */}

      {/* Barra de búsqueda y filtro */}
      <div className="search-container">
        {/* Botón de calendario */}
        <div className="calendar-button-container">
          <button className="calendar-button" onClick={() => setShowCalendar(!showCalendar)}>
            <FaCalendarAlt size={20} />
          </button>
        </div>

        <input
          type="text"
          placeholder="Search by name..."
          value={searchQuery}
          onChange={(e) => {
            setSearchQuery(e.target.value);
            setCurrentPage(1); // 🔹 Resetear paginación al buscar
          }}
        />

        <select
          value={selectedGenre}
          onChange={(e) => {
            setSelectedGenre(e.target.value);
            setCurrentPage(1); // 🔹 Resetear paginación al cambiar género
          }}
        >
          
          <option value="">All Genres</option>
          {genres.map((genre) => (
            <option key={genre} value={genre}>
              {genre}
            </option>
          ))}
        </select>

        {/* Botón de reset con ícono de recarga */}
        <button className="buttonhomereset" onClick={() => { 
          setSearchQuery('');
          setSelectedGenre('');
          setSelectedDate(null);
          setShowCalendar(false);
          setFilteredShows(shows);
          setCurrentPage(1);
        }}>
          <FaSyncAlt size={16} /> Reset Filters
        </button>
      </div>

      {/* Calendario emergente */}
      {showCalendar && (
        <div className="calendar-popup">
          <Calendar
  key={selectedDate ? selectedDate.toISOString() : 'reset'}
  onChange={(date) => {
    setSelectedDate(date);
    setShowCalendar(false);
    setCurrentPage(1); // 🔹 Resetear paginación al seleccionar fecha
  }}
  tileClassName={tileClassName}
/>
        </div>
      )}

       {/* Paginación */}
       <div className="pagination">
        {/* Botón para ir al principio */}
        <button
          onClick={goToFirstPage}
          disabled={currentPage === 1}
          className="pagination-button"
        >
          Inicio
        </button>

        <button
          onClick={prevPage}
          disabled={currentPage === 1}
          className="pagination-button"
        >
          ◀ Anterior
        </button>

        {pageNumbers.slice(currentPage - 1, currentPage + 4).map((number) => (
          <button
            key={number}
            onClick={() => paginate(number)}
            className={`pagination-button ${number === currentPage ? "active" : ""}`}
          >
            {number}
          </button>
        ))}

        <button
          onClick={nextPage}
          disabled={currentPage + 1 > pageNumbers.length}
          className="pagination-button"
        >
          Siguiente ▶
        </button>

        {/* Botón para ir al final */}
        <button
          onClick={goToLastPage}
          disabled={currentPage === pageNumbers.length}
          className="pagination-button"
        >
          Final
        </button>
      </div>



      {/* Verificamos si hay shows filtrados y los mapeamos */}
      <ul className='homecard'>
  {currentShows && currentShows.length > 0 ? (
    currentShows.map((show) => (
      <li className='card' key={show.id}>
        <div className='content'>
          <h3>{show.name}</h3>
          <p>Location/Adress: {show.location}</p>
          <p>Genres: {show.genre.join(', ')}</p>
          <p>Dates: {show.presentation.map((p) => p.date).join(', ')}</p>
        </div>
        {show.coverImage.includes("youtube.com") || show.coverImage.includes("youtu.be") ? (
          <iframe 
            className="event-video"
            src={show.coverImage.replace("watch?v=", "embed/")} 
            title={show.name}
            frameBorder="0"
            allowFullScreen
          ></iframe>
        ) : (
          <img className="event-image" src={show.coverImage} alt={show.name} />
        )}
        <button className='buttonhome' onClick={() => handleViewDetails(show)}>Comprar</button>
      </li>
    ))
  ) : (
    <div>No shows found</div>
  )}
</ul>
    </div>
  );
};

export default ShowsList;
