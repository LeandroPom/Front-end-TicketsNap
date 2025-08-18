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
    <div className="absolute inset-0 bg-black bg-opacity-10 flex items-center justify-center">
      <span className="text-white text-lg font-bold">Evento Finalizado</span>
    </div>
  )}

  {/* Contenido CON padding */}
  <div className="content p-4 flex flex-col flex-grow">
    <h3 className="text-xl font-semibold mb-2 text-white">{show.name}</h3>
    <h5 className="text-gray-200 flex items-center gap-2 text-black-200 mb-1">
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
      style={{ backgroundColor: 'rgba(17, 17, 139, 1)' }}
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
            <h2 className=" pt-20 text-2xl font-semibold mb-4">Sobre Nosotros</h2>
            <p
              className=" whitespace-pre-line overflow-y-auto max-h-[50vh] p-8 font-sans text-base leading-relaxed text-justify bg-black bg-opacity-70 rounded"
              style={{ color: '#fff' }}
            >
             Solticket  es la plataforma de venta de entradas con más beneficios y canales de difusión para tus eventos. Somos una empresa profesional y dinámica enfocados principalmente en  la tecnología, la responsabilidad,el compromiso y la honestidad.
                    Basados fuertemente en nuestros valores trabajamos con un único objetivo,garantizar la satisfacción de nuestros clientes.

                    No lo dejes para mañana , probá Solticket.


                    Servicios Brindados


                    Solticket - TU TICKETERA
                    - Plataforma 100% customizable para comercializar tus eventos.
                    - Experiencia de compra optimizada para smartphones.
                    - Selección de asientos: mapa inteligente para que el comprador seleccione su ubicación exacta durante el proceso de compra.



                    EXPERIENCIAS DIGITALES Y PRESENCIALES
                    - Eventos presenciales, eventos livestreaming, contenido ondemand y experiencias bidireccionales donde el artista ve a su público y el público interactúa con el artista.

                    MAS CANALES DE VENTA
                    - Desde que tu evento se publica, habilitamos distintos canales de venta anticipada para que comprar entradas sea fácil y rápido.

                    GESTIÓN INDEPENDIENTE
                    - Accedes a un Panel para crear tus eventos desde cero, agregar funciones, sectores,precios y cantidad de entradas y hacer modificaciones cuando quieras.

                    REPORTES EN TIEMPO REAL
                    - Tendrás acceso a reportes de ventas diarias ,por fechas, por función, por sector, por canal de venta y hasta un reporte sobre el origen de las ventas.

                    DIFUSIÓN Y PROMOCIÓN
                    - Posicionamos tus eventos a través de campañas de marketing online ,envío de newsletters, notas en nuestro Blog y posteos en redes.

                    ACCESO DIGITALES
                    - Contamos con una app lectora de código QR para control de accesos presenciales.


                    INVITACIONES ESPECIALES
                    - Generas un ticket personalizado para invitados, ganadores, influerncers o cualquier figura diferenciada.

                    LIQUIDEZ SEMANAL
                    -Con TICKET ONE vas a tener facilidades por todos lados para comercializar tus eventos, tenés tu dinero en el momento que Io solicites
            </p>
          </div>
        )}
        {modalContent === 'politicas' && (
          <div>
            <h2 className="pt-20 text-2xl font-semibold mb-4">Términos y condiciones</h2>
            <p
              className="whitespace-pre-line overflow-y-auto max-h-[50vh] p-8 font-sans text-base leading-relaxed text-justify bg-black bg-opacity-70 rounded"
              style={{ color: '#fff' }}
            >
              <strong>TERMINOS Y CONDICIONES</strong><br />
              Última actualización: [15/08/2025]<br /><br />
              TÉRMINOS Y CONDICIONES
              <br />
              TÉRMINOS Y CONDICIONES

                    Este contrato describe los términos y condiciones de venta (en adelante  “Términos y Condiciones”) aplicables al uso de los servicios ofrecidos por SOLTICKET para la compra, por cuenta y orden de un tercero, de entradas (en adelante, “Entradas”) a eventos, festivales, fiestas, entretenimientos (en adelante, “Eventos”). Cualquier persona que desee adquirir una Entrada (en adelante, el “Cliente”) podrá hacerlo sujetándose a los Términos y Condiciones, junto con todas las demás políticas y principios que rigen el uso de Solticket y que son incorporados al presente por referencia.

                    CUALQUIER PERSONA QUE NO ACEPTE ESTOS TÉRMINOS Y CONDICIONES DE VENTA, LOS CUALES TIENEN UN CARÁCTER OBLIGATORIO Y VINCULANTE, DEBERÁ ABSTENERSE DE UTILIZAR SOLTICKET.

                    DESCRIPCION DE LOS SERVICIOS

                    Solticket no es la organizadora, productora y/o promotora de los Eventos cuyas Entradas comercializa. Solticket se limita a vender entradas por cuenta y orden de los organizadores, empresarios, realizadores, productores y/o promotores (en adelante los “Promotores”) de los respectivos eventos cuyos datos se encuentran impresos en el anverso de las Entradas. Solticket pone a disposición de los Clientes la venta de Entradas para determinados Eventos organizados y/o producidos por los Promotores a través del sitio de Internet o “website” al cual se accede a través del Localizador Uniforme de Recursos (URL) www.solticket.com (en adelante, el “Sitio”). El Cliente declara conocer que la realización de cualquier Evento, del que compre sus entradas a través del sistema Solticket no depende de SOLTICKET.COM, esta responsabilidad es de los “Promotores”, y de él dependen los horarios, condiciones de seguridad, ubicaciones, realización, organización o contenido del Evento.



                    COMPRA DE ENTRADA

                    La compra de Entradas a través del Sitio podrán ser realizados mediante el uso de Tarjetas de Crédito y/o Tarjetas de Débito (en adelante, las “Tarjetas”). A fin de adquirir Entradas el Cliente deberá completar el formulario de registración al cual se accede a través del enlace denominado “www.solticket.com/profile” ubicado en el Sitio (en adelante, el “Formulario de Registración”), en todos sus campos con su información personal de manera exacta, precisa y verdadera (en adelante, “Datos Personales”). El Cliente asume el compromiso de actualizar los Datos Personales conforme resulte necesario. El Cliente acepta haber proporcionado toda la información real personal requerida, y es él únicamente responsable por la información que no sea real allí registrada. Quien suministre información o use su entrada para falsificaciones o adulteraciones será responsable en los términos que dicten la normativa vigente Argentina. Las compras realizadas por el sistema Solticket mediante el uso de Tarjetas, están sujetas a la verificación de los datos y aceptación de la transacción por parte de la entidad financiera emisora de la tarjeta.

                    Las Entradas no podrán ser utilizadas en ningún caso para su reventa y/o aplicación comercial o de promoción alguna sin la previa autorización por escrito del Organizador o de Solticket.



                    COSTO DEL SERVICIO

                    El Cliente acepta conocer que cada Entrada que compre tiene un costo adicional por el servicio ofrecido a través del sistema de Solticket, (en adelante, “Cargo de Servicio”), el cual varía dependiendo del Evento. El importe del Cargo de Servicio será aquel publicado en el Sitio.



                    NO CAMBIOS / NI DEVOLUCIONES

                    No se permiten cambios o devoluciones de Entradas. El Cliente acepta que los datos del Evento, número de Entradas, ubicaciones, valor de las entradas, fechas y horas del Evento, han sido revisadas por él y la información ingresada al sistema Solticket es de su responsabilidad.



                    NO A LA REVENTA

                    Las entradas adquiridas a través de Solticket.com son personales e intransferibles; por lo tanto, se encuentra prohibida su reventa así como su utilización con fines comerciales o promocionales de acuerdo con lo establecido en los Términos y Condiciones de Venta aceptados al momento de realizar la compra. En caso de reventa de las entradas (incluyendo su reventa a través de sitios de Internet), éstas serán anuladas y se prohibirá el ingreso al espectáculo a su portador. Asimismo, se realizarán las denuncias penales correspondientes para la aplicación de las penas establecidas en el Código Contravencional de la jurisdicción correspondiente.



                    ENVIO DE ENTRADA

                    Para eventos, espectáculos, fiestas, El Cliente recibirá las entradas a través de correo electrónico proporcionándole un código QR  de Solticket. El Cliente acepta que las Entradas adquiridas con cualquiera de las Tarjetas podrán recibirse a través del correo electrónico validado en el Formulario de Registración o bien ser recogidas en cualquiera de los Puntos de Venta de Solticket, por el titular de la misma, quien deberá presentar una identificación válida que acredite su identidad (D.N.I., Cédula, Pasaporte) y firmar el recibo correspondiente como constancia de aceptación. Asegúrese de proporcionar el correo electrónico de manera correcta al momento de realizar su compra. Es de su exclusiva responsabilidad la información volcada en el sitio. Cuando la compra es realizada con tarjeta de crédito, cuando adquiera sus Entradas por Boletería, las mismas SOLAMENTE pueden ser entregadas a la persona que realizó la compra, sea ésta Titular de la Tarjeta de crédito utilizada para realizar la compra, o de la tarjeta adicional utilizada a tales fines mediante acreditación fehaciente de su identidad. Por ello, no olvide tener consigo lo siguiente al momento del retiro por Boletería:

                    1- Tarjeta de Crédito o Débito del titular o adicional de la misma con la cual se realizó la compra. El titular de la tarjeta, o su adicional, que se exhiba debe coincidir con quien realizó la compra.

                    2- Documento de identidad (Cédula de Identidad, DNI o Pasaporte) del Titular de la Tarjeta de Crédito o adicional de la misma, según corresponda.

                    Tenga en cuenta estos requisitos, ya que son necesarios para hacerle entrega de las entradas y Solticket deslinda todo tipo de responsabilidad en este sentido. Recuerde que estos procedimientos han sido implementados para su seguridad como usuario de Tarjeta de Crédito.



                    SUSPENSION Y CANCELACION DE EVENTOS

                    Si un Evento es cancelado por cualquier motivo, la devolución del precio de la Entrada se realizara en el lugar especialmente determinado oportunamente por el Promotor del Evento a tal efecto. Solticket no es la organizadora, productora y/o promotora de los Eventos cuyas Entradas comercializa por lo que no se responsabiliza por los daños directos ocasionados al adquirente como resultado de la cancelación o suspensión de los Eventos.



                    DERECHOS DE LOS PROMOTORES

                    No está permitido el ingreso a los Eventos con cámaras fotográficas, grabadoras de audio y/o de vídeo. El adquirente de Entradas presta su conformidad para que su imagen sea incluida en producciones que se realicen por vía televisiva, fonográfica y/o audiovisual. Las Entradas solo serán consideradas válidas para ingresar al Evento siempre que hayan sido adquiridas a través de Solticket.



                    ENTRADAS DAÑADAS O PERDIDAS

                    El ingreso a los Eventos puede ser denegado si las Entradas se encuentran dañadas o desfiguradas en modo alguno. Solticket se reserva el derecho de cobrar un cargo por la sustitución de las Entradas dañadas. La sustitución de las Entradas dañadas y/o perdidas, por cualquier causa que sea, está sujeta a la discrecionalidad del Promotor dado que entregada la Entrada al Comprador cesa toda responsabilidad del Promotor sobre la misma toda vez que su tenencia y custodia corresponde a el Comprador.



                    MODIFICACION DE LOS TERMINOS Y CONDICIONES

                    Solticket podrá modificar los Términos y Condiciones en cualquier momento haciendo públicos en el Sitio las partes de los mismos que sean modificadas. Todos los términos modificados entrarán en vigor a los 10 (diez) días de su publicación en el Sitio.



                    JURISDICCION Y LEY APLICABLE

                    Toda controversia en la interpretación y ejecución de este Contrato, será resuelta de acuerdo a la Ley Argentina y será sometida a la jurisdicción de la Justicia Nacional en lo Civil y Comercial con asiento en la Ciudad Autónoma de Buenos Aires de la República Argentina, con renuncia a cualquier otro fuero y/o jurisdicción que les pudiera corresponder.

                    Correo Electrónico: <a href="mailto:solticket.show@gmail.com" style={{ color: "#fff; text-decoration: underline" }}>solticket.show@gmail.com</a><br />
              <br />
              {/* Correo Electrónico: <a href="mailto:solticket.show@gmail.com" className="underline text-white">solticket.show@gmail.com</a><br /> */}
            </p>
          </div>
        )}
        {modalContent === 'preguntas' && (
          <div>
            <h2 className="pt-20 text-2xl font-semibold mb-4">Preguntas frecuentes</h2>
            <p
              className="whitespace-pre-line overflow-y-auto max-h-[50vh] p-8 font-sans text-base leading-relaxed text-justify bg-black bg-opacity-70 rounded"
              style={{ color: '#fff' }}
            >
              <strong></strong><br />
              
               
                    ¿Cómo canjeo mis entradas una vez que las compré?

                    Canjear tus entradas es muy fácil. No hace falta que imprimas nada.
                    1- Cuando hagas una compra en Solticket, obtendrás un CÓDIGO QR que te permitirá acceder al evento.
                    Además, lo recibirás por e-mail (por las dudas, revisá la bandeja de Correo no deseado).
                    2- Antes de que comience el espectáculo, presentate en la boletería del teatro o predio con tu código qr y tu DNI para retirar tus entradas.

                    ¿Qué hago si me olvidé o perdí mi código de compra?

                    1- Podés encontrar el código para canjear tus entradas en el mail que te mandamos automáticamente cuando hiciste tu compra.
                    2- También tenés tu código disponible si te logueás en Solticket.com  y entras en la sección MIS TICKETS.


                    ¿Cuándo tengo que canjear mi código por las entradas?

                    Podés canjear tus entradas, el mismo día del espectáculo hasta un rato antes de que comience.

                    ¿Sólo se puede comprar con tarjeta de crédito en Solticket?

                    Sí, Solticket  solo trabaja con tarjeta de crédito y utiliza la plataforma de Mercadopago como medio seguro para efectuar tu compra.

                    ¿Puedo devolver mis entradas una vez que las compré?

                    No. No se realizan cambios, reintegros ni devoluciones.

                    ¿Cuál es el precio final que debo abonar por mi entrada?

                    El precio final es el precio de la entrada y un cargo por servicio, que conocerás antes de efectuar tu compra.

                    No sé si mi transacción se completó. ¿Cómo lo averiguo?

                    Al completar tu transacción, te aparecerá en la pantalla tu código de compra. También te lo enviamos por mail automáticamente. Tener el código de compra es la garantía de que tu transacción se completó. Si querés volver a verificarlo, podés loguearte en Solticket  y encontrar tu código en la sección MIS TICKETS.

                    ¿Cómo se realiza la asignación de localidades?

                    Las butacas se asignan por orden de llegada. O dependiendo el evento con butaca seleccionada.

                    ¿Cuál es la responsabilidad de TicketOne frente al espectáculo?

                    Las entradas son vendidas por Solticket en su carácter de ticketera en representación del Teatro/ Predio/ Productor. Solticket no se responsabiliza por la suspensión o cancelación de la función, espectáculo o evento a realizarse.

                    Si el espectáculo se llega a posponer por algún motivo, tus entradas adquiridas en TicketOne seguirán siendo válidas para la nueva fecha del espectáculo. Ante cualquier duda, consultá los términos y condiciones de compra.

                    Perdí mi contraseña. ¿Cómo la recupero?

                    1- Ingresá a www.solticket.com
                    2- Dale clic al link que te permite recuperar tu contraseña y te llegará una nueva contraseña a tu casilla de mail.

                    ¿Qué es un código QR?

                    Un Código QR (Quick Response) es un código de respuesta rápida que almacena información para ser leída a gran velocidad.
                    Ticket One utiliza códigos QR para que accedas directamente a los eventos, sin canjear entradas.

                   

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










