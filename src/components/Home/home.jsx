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

  useEffect(() => {
    dispatch(getShows());
  }, [dispatch]);

  // Filtrar shows por búsqueda, género y fecha seleccionada
  useEffect(() => {
    const filtered = shows.filter((show) => {
      const matchesSearch = show.name.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesGenre = selectedGenre ? show.genre.includes(selectedGenre) : true;

      // Si hay una fecha seleccionada, verificamos si coincide con alguna presentación
      const matchesDate = selectedDate
        ? show.presentation.some((p) => p.date === selectedDate.toISOString().split('T')[0])
        : true;

      return matchesSearch && matchesGenre && matchesDate;
    });
    setFilteredShows(filtered);
  }, [searchQuery, selectedGenre, selectedDate, shows]);

  // Extraer las imágenes de los shows para el carrusel
  const carouselImages = shows.map((show) => show.coverImage).filter(Boolean);

  // Obtener las fechas con eventos para marcarlas en el calendario
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

  const handleViewDetails = (showId) => {
    navigate(`/event/${showId}`);
  };

  // Generar imágenes para el carrusel
  // const carouselImages = shows.map((show) => ({
  //   src: show.coverImage,
  //   alt: show.name,
  // }));

  const genres = [...new Set(shows.flatMap((show) => show.genre))];

  // Resetear todos los filtros
  const resetFilters = () => {
    setSearchQuery('');
    setSelectedGenre('');
    setSelectedDate(null);
  };

  return (
    <div className="home">
      {/* Reemplazar el título por el carrusel */}
      <Carousel images={carouselImages} />

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
          onChange={(e) => setSearchQuery(e.target.value)}
        />
        <select
          value={selectedGenre}
          onChange={(e) => setSelectedGenre(e.target.value)}
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
        }}>
          <FaSyncAlt size={16} /> Reset Filters
        </button>
      </div>

      {/* Calendario emergente */}
      {showCalendar && (
        <div className="calendar-popup">
          <Calendar
            onChange={(date) => {
              setSelectedDate(date);
              setShowCalendar(false); // Ocultar calendario después de seleccionar
            }}
            tileClassName={tileClassName}
          />
        </div>
      )}

      {/* Verificamos si hay shows filtrados y los mapeamos */}
      <ul className='homecard'>
        {filteredShows && filteredShows.length > 0 ? (
          filteredShows.map((show) => (
            <li className='card' key={show.id}>
              <div className='content'>
              <h3>{show.name}</h3>
              <p>{show.description}</p>
              <p>Location: Floresta</p>
              <p>Genres: {show.genre.join(', ')}</p>
              {/* <p>Artists: {show.artists.join(', ')}</p> */}
              <p>Dates: {show.presentation.map((p) => p.date).join(', ')}</p>
              </div>
              <img className="event-image" src={show.coverImage} alt={show.name} />
              <button className='buttonhome' onClick={() => handleViewDetails(show.id)}>View Details</button>
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
