import { useSelector, useDispatch } from 'react-redux';
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Calendar from 'react-calendar'; // Importar el calendario
import 'react-calendar/dist/Calendar.css'; // Importar los estilos predeterminados
import { FaSyncAlt } from 'react-icons/fa';
import { getShows } from '../Redux/Actions/actions';
import '../Home/home.css'; // Asegúrate de que el archivo contenga estilos actualizados
import { FaMusic, FaMapMarkerAlt, FaWhatsapp, FaTwitter, FaFacebook, FaInstagram} from 'react-icons/fa';

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
  const [showsPerPage] = useState(4); // Número de shows por página
  const [isModalOpen, setIsModalOpen] = useState(false); // Estado para el modal
  const [modalContent, setModalContent] = useState(''); // Estado para el contenido del modal

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
  const whatsappNumber = '03816698011'; // Reemplazar con el número real
  const message = '¡Hola, tengo una consulta sobre mi compra!';


  return (
    <div className="home">
      
      <div>
    <Carousel images={carouselImages} isVideoPlaying={isVideoPlaying} /> {/* Pasamos el estado al carrusel */}
    <img
      src="/images/mpticketsol.png"
      alt="Sol Ticket"
      style={{
        position: 'absolute',
        top: '490px', // O ajusta la posición según sea necesario
        left: '50%',
        transform: 'translateX(-50%)', // Centra la imagen
        zIndex: '999', // Asegura que la imagen esté por encima de otros elementos
        width: '1400px',
        height: '100px',
        margin: "1px",
      }}
    />
    </div>
      {/* Barra de búsqueda y filtro */}
      <div className="searchs-container">
        {/* Botón de calendario */}
        <div className="calendar-button-container">
          <button className="calendar-button" onClick={() => setShowCalendar(!showCalendar)}>
            <FaCalendarAlt size={20} />
          </button>
        </div>

        

        <input
          type="text"
          placeholder="Buscar por nombre..."
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
          
          <option value="">Todos los generos</option>
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
          <FaSyncAlt size={16} /> Resetear filtros
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
  style={{ backgroundColor: 'transparent' }} // Quitar fondo directamente
/>
        </div>
      )}

{/* <div className="scrolling-text-container">
  <p className="scrollings-text">Solticket somos líder de venta de entradas a eventos en el Norte Argentino. Nos avalan más de 12 años trabajando con productores, teatros, municipios, clubes, empresas y bandas del NOA, NEA y todo el país.</p>
</div> */}


      {/* Verificamos si hay shows filtrados y los mapeamos */}
      <ul className='homecard'>
  {currentShows && currentShows.length > 0 ? (
    currentShows.map((show) => (
      <li className='cardshome' key={show.id}>
        <div className='content'>
          <h3 className='titulo-card'>{show.name}</h3>
          {show.coverImage.includes("youtube.com") || show.coverImage.includes("youtu.be") ? (
          <iframe 
            className="event-video"
            src={show.coverImage.replace("watch?v=", "embed/")} 
            title={show.name}
            frameBorder="0"
            allowFullScreen
          ></iframe>
        ) : (
          <img className="event-image-home" src={show.coverImage} alt={show.name} />
        )}
       
          <h5> <FaMapMarkerAlt style={{ color: 'red' }} /> Dirección:{show.location}</h5>
          <h5><FaMusic style={{ color: 'orange' }} /> Genero:{show.genre.join(', ')}</h5>
          <h5><FaCalendarAlt style={{ color: 'green' }} /> Fecha:{show.presentation.map((p) => p.date).join(', ')}</h5>
        

        </div>
        
        <button className='buttonhome' onClick={() => handleViewDetails(show)}>Comprar</button>
      </li>
    ))
  ) : (
    <div>No se encontraron Eventos !!!. Resetea el filtrado y vuelve a intentar la busqueda</div>
  )}

  
</ul>

{/* Paginación */}
<div >
        {/* Botón para ir al principio */}
        <button
          onClick={goToFirstPage}
          disabled={currentPage === 1}
          className="paginate-boton"
        >
          Inicio
        </button>

        <button
          onClick={prevPage}
          disabled={currentPage === 1}
          className="paginate-boton"
        >
          ◀ Anterior
        </button>

        {pageNumbers.slice(currentPage - 1, currentPage + 4).map((number) => (
          <button
            key={number}
            onClick={() => paginate(number)}
            className={`paginate-botonact ${number === currentPage ? "active" : ""}`}
          >
            {number}
          </button>
        ))}

        <button
          onClick={nextPage}
          disabled={currentPage + 1 > pageNumbers.length}
          className="paginate-boton"
        >
          Siguiente ▶
        </button>

        {/* Botón para ir al final */}
        <button
          onClick={goToLastPage}
          disabled={currentPage === pageNumbers.length}
          className="paginate-boton"
        >
          Final
        </button>
      </div>

      <div className="footer">
  {/* Enlaces del footer */}
  <div className="footer-links">
    <a href="#" onClick={() => openModal('contacto')}>Contacto</a>
    <a href="#" onClick={() => openModal('sobreNosotros')}>Sobre Nosotros</a>
    <a href="#" onClick={() => openModal('politicas')}>Política de privacidad</a>
  </div>

  {/* Redes sociales dentro del footer */}
  <div className="social-links">
    <a href="https://x.com/SolTicketShow" target="_blank" rel="noopener noreferrer">
      <img 
        src="/images/X-Logo.png" 
        alt="X" 
        style={{ width: '33px', height: '30px' }} 
      />
    </a>
    <a href="https://facebook.com/profile.php?id=61574068944152" target="_blank" rel="noopener noreferrer">
      <FaFacebook size={30} color="#3b5998" />
    </a>
    <a href="https://instagram.com/solticketshow" target="_blank" rel="noopener noreferrer">
      <FaInstagram size={30} color="#E4405F" />
    </a>
    {/* Enlace de WhatsApp */}
    <a
      href={`https://wa.me/${whatsappNumber}?text=${encodeURIComponent(message)}`}
      target="_blank"
      rel="noopener noreferrer"
      className="whatsapp-link"
    >
      <FaWhatsapp size={30} color="#25D366" />
    </a>
  </div>

  {/* Derechos reservados */}
  <p style={{ color: "white", marginTop: "30px", }}>&copy; 2025 SolTicket. Todos los derechos reservados.</p>

  
</div>
      {/* Modal */}
      {isModalOpen && (
        <div className="modal-overlay">
          <div className="modal-content">
            <button className="close-button" onClick={closeModal}>X</button>
            <div className="modal-body">
              {modalContent === 'contacto' && (
                <div>
                  <h2>Contacto</h2>
                  <p>Para contactarte con nosotros, utiliza los links directos de nuestras redes sociales que se encuentran debajo del link de contactos, o para una atención mas personalizada podes contactarte via wathssap a nuestro numero principal y comunicarte directamente con un gerente comercial. Gracias por confiar en Solticket.</p>
                </div>
              )}
              {modalContent === 'sobreNosotros' && (
                <div>
                  <h2>Sobre Nosotros</h2>
                  <p>¡Líderes en la venta de entradas a eventos en el Norte Argentino!

                      Más de 12 años de experiencia nos avalan.
                      Trabajamos de la mano con productores, teatros, municipios, clubes, empresas y bandas en todo el país.
                      ¡Desde el NOA hasta el NEA, llevamos los mejores eventos a tu alcance!

                      ¡Con Solticket, cada evento es una experiencia única!</p>
                </div>
              )}
              {modalContent === 'politicas' && (
                <div>
                  <h2>Política de Privacidad</h2>
                  <p
  style={{
    whiteSpace: "pre-line",
    overflowY: "auto",
    maxHeight: "50vh",
    padding: "50px",
    fontFamily: "Arial, sans-serif",
    fontSize: "16px",
    lineHeight: "1.6",
    textAlign: "justify",
    color: "#fff",
    backgroundColor: "rgba(0, 0, 0, 0.7)",
    borderRadius: "8px",
    margin: "30px 0",
  }}
>
  <strong>Política de Privacidad</strong><br />
  Última actualización: [15/03/2025]<br /><br />
  
  En SolTicket nos tomamos muy en serio la privacidad de nuestros usuarios. Esta Política de Privacidad tiene como objetivo informarte sobre cómo recopilamos, usamos, protegemos y compartimos tu información personal. Al utilizar nuestro sitio web, aceptas los términos establecidos en esta política.<br /><br />

  <strong>1. Información que Recopilamos</strong><br />
  Recopilamos información personal cuando te registras en nuestro sitio, realizas una compra, o interactúas de alguna manera con nosotros. Los tipos de información que podemos recopilar incluyen:<br /><br />

  • Información personal identificable: nombre, dirección de correo electrónico, número de teléfono, dirección de facturación.<br />
  • Información no personal: datos sobre tu navegador.<br /><br />

  <strong>2. Cómo Usamos Tu Información</strong><br />
  Utilizamos la información que recopilamos para los siguientes fines:<br /><br />

  • Procesar y gestionar tus compras: para completar tus pedidos de entradas y gestionar la comunicación relacionada con ellos.<br />
  • Mejorar nuestro servicio: para mejorar la experiencia del usuario y personalizar el contenido que mostramos.<br />
  • Enviarte promociones: podemos llegar a enviarte correos electrónicos relacionados con productos, servicios o eventos de interés.<br />
  • Cumplir con obligaciones legales: cuando sea necesario para cumplir con leyes, regulaciones o procesos legales.<br /><br />

  <strong>3. Protección de tu Información</strong><br />
  Implementamos medidas de seguridad físicas, electrónicas y administrativas para proteger tu información personal. Sin embargo, ten en cuenta que ningún sistema de transmisión de datos por Internet o sistema de almacenamiento electrónico es completamente seguro, y no podemos garantizar la seguridad absoluta.<br /><br />

  <strong>4. Uso de Cookies</strong><br />
  Este sitio utiliza cookies para mejorar tu experiencia. Las cookies son pequeños archivos almacenados en tu dispositivo que nos permiten recopilar información sobre el uso de nuestra página web. Puedes configurar tu navegador para



    <strong>9. Contacto</strong><br />
    Si tienes preguntas sobre esta Política de Privacidad, puedes contactarnos en:<br /><br />
    
    Correo Electrónico: <a href="mailto:solticket.show@gmail.com" style={{color: "#fff; text-decoration: underline"}}>solticket.show@gmail.com</a><br />
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

    
    

    

  

