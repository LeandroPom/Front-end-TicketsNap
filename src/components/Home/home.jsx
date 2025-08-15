import { useSelector, useDispatch } from 'react-redux';
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Calendar from 'react-calendar'; // Importar el calendario
import 'react-calendar/dist/Calendar.css'; // Importar los estilos predeterminados
import { FaSyncAlt } from 'react-icons/fa';
import { getShows } from '../Redux/Actions/actions';
import '../Home/home.css'; 
import { FaMusic, FaMapMarkerAlt, FaWhatsapp, FaTwitter, FaFacebook, FaInstagram } from 'react-icons/fa';

import Carousel from './carrousel'; // Importar el carrusel

import { FaCalendarAlt } from 'react-icons/fa'; // Ícono para el botón del calendario

const ShowsList = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const user = useSelector((state) => state.user);
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
  const [isModalOpen, setIsModalOpen] = useState(false); // Estado para el modal
  const [modalContent, setModalContent] = useState(''); // Estado para el contenido del modal

  useEffect(() => {
    dispatch(getShows());
  }, [dispatch]);

 useEffect(() => {
  // Obtener fecha de hoy sin horas para comparación
 const today = new Date();
today.setHours(0, 0, 0, 0);  // Ignorar horas, minutos, segundos

const showsWithNearestDate = shows.map(show => {
  const now = new Date();

const futureDates = show.presentation
  .map(p => {
    // Combinar fecha + hora de inicio
    const dateTimeString = `${p.date}T${p.time?.start || '00:00'}:00`;
    return new Date(dateTimeString);
  })
  .filter(date => date >= now);
    
 const nearestDate = futureDates.length > 0
  ? new Date(Math.min(...futureDates.map(d => d.getTime())))
  : null;
    
  return { ...show, nearestDate };
});


// Filtrar shows que sí tengan fecha próxima
const showsFiltered = showsWithNearestDate.filter(show => show.nearestDate !== null);

// Ordenar por nearestDate ascendente
showsFiltered.sort((a, b) => a.nearestDate - b.nearestDate);


  // Filtrar shows
  let filtered = showsWithNearestDate.filter((show) => {
    const matchesSearch = show.name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesGenre = selectedGenre ? show.genre.includes(selectedGenre) : true;
    const matchesDate = selectedDate
      ? show.presentation.some((p) => p.date === selectedDate.toISOString().split('T')[0])
      : true;
    return matchesSearch && matchesGenre && matchesDate && show.state;
  });

  // Ordenar por nearestDate
  // Convertir nearestDate a timestamp para evitar problemas
filtered.sort((a, b) => {
  const timeA = a.nearestDate ? a.nearestDate.getTime() : Infinity;
  const timeB = b.nearestDate ? b.nearestDate.getTime() : Infinity;
  return timeA - timeB;
});

  setFilteredShows(filtered);
}, [searchQuery, selectedGenre, selectedDate, shows]);



  // Extraer las imágenes de los shows para el carrusel
  const carouselImages = shows
  .filter((show) => show.state !== false)  // Solo muestra shows activos o sin estado definido
  .map((show) => show.coverImage)          // Extrae las imágenes de los shows activos
  .filter(Boolean);           

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
    if (!user) {
      navigate(`/login`);

    }
    else if (show.isGeneral) {
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

  const openModal = (content) => {
    setModalContent(content); // Establecer el contenido del modal según el enlace
    setIsModalOpen(true); // Abrir el modal
  };

  const closeModal = () => setIsModalOpen(false); // Cerrar el modal


  // Determinamos si el video está siendo reproducido y pasamos ese estado al carrusel
  const handleVideoPlay = () => {
    setIsVideoPlaying(true); // Un video está siendo reproducido
  };

  const handleVideoPause = () => {
    setIsVideoPlaying(false); // El video se detuvo
  };

  // WhatsApp: Aquí definimos el número y mensaje
  const whatsappNumber = '+5493813356799'; // Reemplazar con el número real
  const message = '¡Hola, tengo una consulta sobre mi compra!';


  return (
  <div className="home">

    <div>
      <Carousel images={carouselImages} isVideoPlaying={isVideoPlaying} />
    </div>

    <div className="w-screen px-0 overflow-hidden mt-32">
      <img
        src="/images/mpticketsol.png"
        alt="MercadoPago Ticket 1"
        className="w-screen h-auto object-fill -ml-7.5" // -30px = -7.5 * 4px (Tailwind scale)
      />
      <img
        src="/images/MP-2.png"
        alt="MercadoPago Ticket 2"
        className="w-screen h-auto object-fill -ml-7.5"
      />
    </div>

<div className=" bg-customBlue w-full max-w-5xl mx-auto px-4 py-4  rounded-md shadow-sm box-border space-y-4">
  
  {/* Input búsqueda */}
  <div className="bg-customBlue w-full text-black">
    <input
      type="text"
      placeholder="Buscar por nombre..."
      value={searchQuery}
      onChange={(e) => {
        setSearchQuery(e.target.value);
        setCurrentPage(1);
      }}
      className="border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 w-full"
    />
  </div>

  {/* Select género */}
  <div className="bg-customBlue w-full text-black">
    <select
      value={selectedGenre}
      onChange={(e) => {
        setSelectedGenre(e.target.value);
        setCurrentPage(1);
      }}
      className="border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 w-full md:max-w-xs"
    >
      <option value="">Todos los géneros</option>
      {genres.map((genre) => (
        <option key={genre} value={genre}>
          {genre}
        </option>
      ))}
    </select>
  </div>

  {/* Botón reset */}
  <div className="bg-customBlue w-full flex justify-start">
    <button
      className="buttonhomereset flex items-center gap-2 text-gray-400 px-4 py-2 rounded hover:bg-blue-900 transition justify-center"
      onClick={() => {
        setSearchQuery('');
        setSelectedGenre('');
        setSelectedDate(null);
        setShowCalendar(false);
        setFilteredShows(shows);
        setCurrentPage(1);
      }}
    >
      <FaSyncAlt size={16} /> Resetear filtros
    </button>
    {/* Botón calendario */}
  <div className="bg-customBlue w-full flex justify-start">
    <button
      className="calendar-button bg-white p-2 rounded shadow hover:bg-blue-900 transition flex items-center justify-center"
      onClick={() => setShowCalendar(!showCalendar)}
      aria-label="Mostrar calendario"
    >
      <FaCalendarAlt size={20} />
    </button>
  </div>

  </div>
  
</div>

{/* Calendario emergente como modal */}
{showCalendar && (
  <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
    <div className="relative bg-customBlue rounded shadow-lg p-4 w-full max-w-md mx-4 sm:mx-auto">
      
      {/* Botón de cerrar */}
      <button
        className="absolute top-2 right-2 text-white hover:text-gray-300 text-xl font-bold"
        onClick={() => setShowCalendar(false)}
        aria-label="Cerrar calendario"
      >
        &times;
      </button>

      <Calendar
        key={selectedDate ? selectedDate.toISOString() : 'reset'}
        onChange={(date) => {
          setSelectedDate(date);
          setShowCalendar(false);
          setCurrentPage(1);
        }}
        tileClassName={tileClassName}
      />
    </div>
  </div>
)}

   <ul className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 mt-6 px-4">
  {currentShows && currentShows.length > 0 ? (
    currentShows.map((show) => (
   <li
  key={show.id}
  onClick={() => {
    if (show.nearestDate !== null) handleViewDetails(show);
  }}
  className={`
    max-w-[320px] w-full mx-auto rounded-lg shadow overflow-hidden flex flex-col
    ${show.nearestDate === null ? 'cursor-not-allowed opacity-50' : 'cursor-pointer hover:shadow-lg'}
    transition bg-[rgba(55,55,107,0.4)] backdrop-blur-md border border-white/20
  `}
  role="button"
  tabIndex={0}
  onKeyDown={(e) => {
    if ((e.key === 'Enter' || e.key === ' ') && show.nearestDate !== null) {
      handleViewDetails(show);
    }
  }}
>
  {/* Imagen SIN margen, parte integral de la card */}
  {show.coverImage.includes('youtube.com') || show.coverImage.includes('youtu.be') ? (
    <iframe
      className="w-full aspect-video"
      src={show.coverImage.replace('watch?v=', 'embed/')}
      title={show.name}
      frameBorder="0"
      allowFullScreen
    ></iframe>
  ) : (
    <img
      className="w-full h-48 object-cover"
      src={show.coverImage}
      alt={show.name}
    />
  )}

  {/* Overlay si el evento está finalizado */}
  {show.nearestDate === null && (
    <div className="absolute inset-0 bg-black bg-opacity-60 flex items-center justify-center">
      <span className="text-white text-lg font-bold">Evento Finalizado</span>
    </div>
  )}

  {/* Contenido CON padding */}
  <div className="content p-4 flex flex-col flex-grow">
    <h3 className="text-xl font-semibold mb-2 text-gray-400">{show.name}</h3>
    <h5 className="text-gray-400 flex items-center gap-2 text-black-200 mb-1">
      <FaMapMarkerAlt /> Dirección: {show.location}
    </h5>
    <h5 className="text-gray-400 flex items-center gap-2 text-black-100 mb-1">
      <FaMusic /> Género: {show.genre.join(', ')}
    </h5>
    <h5 className="text-gray-400 flex items-center gap-2 text-black-200 mb-4">
      <FaCalendarAlt /> Fecha: {show.presentation.map((p) => p.date).join(', ')}
    </h5>

    <button
      onClick={(e) => {
        e.stopPropagation();
        if (show.nearestDate !== null) handleViewDetails(show);
      }}
      disabled={show.nearestDate === null}
      className={`mt-auto text-gray-400 font-semibold rounded py-2 transition 
        ${show.nearestDate === null ? 'opacity-50 cursor-not-allowed' : 'hover:bg-gray-200'}`}
      style={{ backgroundColor: 'rgba(72, 72, 128, 1)' }}
    >
      Comprar
    </button>
  </div>
</li>

    ))
  ) : (
    <div className="col-span-full text-center text-red-600 font-semibold mt-6">
      No se encontraron Eventos !!!. Resetea el filtrado y vuelve a intentar la búsqueda
    </div>
  )}
</ul>



    {/* Paginación */}
    <div className="paginate-container flex justify-center gap-2 mt-6 flex-wrap px-4 text-black">
      <button
        onClick={goToFirstPage}
        disabled={currentPage === 1}
        className="paginate-boton disabled:opacity-50 bg-gray-200 px-3 py-1 rounded hover:bg-gray-300 transition"
      >
        Inicio
      </button>
      <button
        onClick={prevPage}
        disabled={currentPage === 1}
        className="paginate-boton disabled:opacity-50 bg-gray-200 px-3 py-1 rounded hover:bg-gray-300 transition"
      >
        ◀ Anterior
      </button>

      {pageNumbers.slice(currentPage - 1, currentPage + 4).map((number) => (
        <button
          key={number}
          onClick={() => paginate(number)}
          className={`bg-blue-600 text-white px-3 py-1 rounded ${
            number === currentPage ? 'bg-blue-600 text-white' : 'bg-gray-200 hover:bg-gray-300'
          } transition`}
        >
          {number}
        </button>
      ))}

      <button
        onClick={nextPage}
        disabled={currentPage + 1 > pageNumbers.length}
        className="paginate-boton disabled:opacity-50 bg-gray-200 px-3 py-1 rounded hover:bg-gray-300 transition"
      >
        Siguiente ▶
      </button>

      <button
        onClick={goToLastPage}
        disabled={currentPage === pageNumbers.length}
        className="paginate-boton disabled:opacity-50 bg-gray-200 px-3 py-1 rounded hover:bg-gray-300 transition"
      >
        Final
      </button>
    </div>

  {/* Footer */}
<footer className="bg-gray-900 text-white py-8 mt-12 px-4 sm:px-8 md:px-12 select-none">
  <div className="max-w-screen-xl mx-auto flex flex-col items-center gap-6">

    {/* Links principales arriba */}
    <nav className="flex flex-wrap justify-center gap-4 sm:gap-6 max-w-lg w-full">
      {['contacto', 'sobreNosotros', 'politicas', 'preguntas'].map((item) => {
        const labels = {
          contacto: 'Contacto',
          sobreNosotros: 'Sobre Nosotros',
          politicas: 'Política de privacidad',
          preguntas: 'Preguntas frecuentes',
        };
        return (
          <a
            key={item}
            href="#"
            onClick={() => openModal(item)}
            className="
              hover:underline
              transition-colors duration-300
              hover:text-blue-400
              focus:outline-none focus:ring-2 focus:ring-blue-500
              rounded
              text-center
              break-words
              min-w-[100px]
              px-2
              py-1
              sm:min-w-auto
            "
            tabIndex={0}
            aria-label={`Abrir modal de ${labels[item]}`}
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') openModal(item);
            }}
          >
            {labels[item]}
          </a>
        );
      })}
    </nav>

    {/* Redes sociales abajo */}
    <div className="flex justify-center gap-6 max-w-xs w-full">
      <a
        href="https://x.com/SolTicketShow"
        target="_blank"
        rel="noopener noreferrer"
        aria-label="X"
        className="flex items-center transform hover:scale-110 transition-transform duration-300 mx-auto"
      >
        <img src="/images/X-Logo.png" alt="X" className="w-[33px] h-[30px]" />
      </a>
      <a
        href="https://facebook.com/profile.php?id=61574068944152"
        target="_blank"
        rel="noopener noreferrer"
        aria-label="Facebook"
        className="flex items-center transform hover:scale-110 transition-transform duration-300 mx-auto"
      >
        <FaFacebook size={30} color="#3b5998" />
      </a>
      <a
        href="https://instagram.com/solticketshow"
        target="_blank"
        rel="noopener noreferrer"
        aria-label="Instagram"
        className="flex items-center transform hover:scale-110 transition-transform duration-300 mx-auto"
      >
        <FaInstagram size={30} color="#E4405F" />
      </a>
      <a
        href={`https://wa.me/${whatsappNumber}?text=${encodeURIComponent(message)}`}
        target="_blank"
        rel="noopener noreferrer"
        aria-label="WhatsApp"
        className="flex items-center transform hover:scale-110 transition-transform duration-300 mx-auto"
      >
        <FaWhatsapp size={30} color="#25D366" />
      </a>
    </div>

  </div>

  {/* Derechos */}
  <p
    className="
      text-center text-white mt-8 text-sm sm:text-base
      select-text
      opacity-90 hover:opacity-100 transition-opacity duration-300
      max-w-xs mx-auto
    "
  >
    &copy; 2025 SolTicket. Todos los derechos reservados.
  </p>
</footer>


{/* Modal */}
{isModalOpen && (
  <div className="modal-overlays fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50">
    <div className="modal-content bg-gray-800 rounded-lg max-w-3xl w-full p-6 relative text-white max-h-[90vh] overflow-y-auto">
      <button
        className="close-button absolute top-4 right-4 text-white text-xl font-bold hover:text-gray-400 transition"
        onClick={closeModal}
        aria-label="Cerrar modal"
      >
        X
      </button>
      <div className="modal-body space-y-4">
        {modalContent === 'contacto' && (
          <div>
            <h2 className="text-2xl font-semibold mb-2">Contacto</h2>
            <p>
              Para contactarte con nosotros, utiliza los links directos de nuestras redes sociales que se encuentran debajo del link de contactos, o para una atención mas personalizada podes contactarte via wathssap a nuestro numero principal y comunicarte directamente con un gerente comercial. Gracias por confiar en Solticket.
            </p>
          </div>
        )}
        {modalContent === 'sobreNosotros' && (
          <div>
            <h2 className="text-2xl font-semibold mb-4">Sobre Nosotros</h2>
            <p
              className="whitespace-pre-line overflow-y-auto max-h-[50vh] p-8 font-sans text-base leading-relaxed text-justify bg-black bg-opacity-70 rounded"
              style={{ color: '#fff' }}
            >
              Solticket es la plataforma de venta de entradas con más beneficios y canales de difusión para tus eventos. Somos una empresa profesional y dinámica enfocados principalmente en la tecnología, la responsabilidad, el compromiso y la honestidad.
              Basados fuertemente en nuestros valores trabajamos con un único objetivo, garantizar la satisfacción de nuestros clientes.

              No lo dejes para mañana, probá Solticket.
            </p>
          </div>
        )}
        {modalContent === 'politicas' && (
          <div>
            <h2 className="text-2xl font-semibold mb-4">Términos y condiciones</h2>
            <p
              className="whitespace-pre-line overflow-y-auto max-h-[50vh] p-8 font-sans text-base leading-relaxed text-justify bg-black bg-opacity-70 rounded"
              style={{ color: '#fff' }}
            >
              <strong>TERMINOS Y CONDICIONES</strong><br />
              Última actualización: [15/03/2025]<br /><br />
              TÉRMINOS Y CONDICIONES
              <br /><br />
              Correo Electrónico: <a href="mailto:solticket.show@gmail.com" className="underline text-white">solticket.show@gmail.com</a><br />
            </p>
          </div>
        )}
        {modalContent === 'preguntas' && (
          <div>
            <h2 className="text-2xl font-semibold mb-4">Preguntas frecuentes</h2>
            <p
              className="whitespace-pre-line overflow-y-auto max-h-[50vh] p-8 font-sans text-base leading-relaxed text-justify bg-black bg-opacity-70 rounded"
              style={{ color: '#fff' }}
            >
              <strong>Preguntas frecuentes</strong><br />
              Preguntas frecuentes

              <br />
              Correo Electrónico: <a href="mailto:solticket.show@gmail.com" className="underline text-white">solticket.show@gmail.com</a><br />
            </p>
          </div>
        )}
      </div>
    </div>
  </div>
)}

  </div>
);
};
export default ShowsList;










