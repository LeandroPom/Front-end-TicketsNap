import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux'; // Usamos Redux para obtener los shows
import { getShows } from '../Redux/Actions/actions'; // Acción para obtener todos los eventos
import '../Eventdetail/detail.css';

const Detail = () => {
  const { id } = useParams(); // Obtener el ID del evento desde la URL
  const navigate = useNavigate(); // Usar el hook navigate para redirigir a otras rutas
  const dispatch = useDispatch(); // Hook para despachar acciones

  const { shows, loading, error } = useSelector((state) => state); // Accedemos al estado global
  const [selectedSeats, setSelectedSeats] = useState([]); // Asientos seleccionados
  const [isModalOpen, setIsModalOpen] = useState(false); // Si el modal está abierto
  const [showWarning, setShowWarning] = useState(true); // Para mostrar el mensaje de advertencia
  const [timerExpired, setTimerExpired] = useState(false); // Para manejar la expiración del temporizador
  const [timerStart, setTimerStart] = useState(false); // Para iniciar el temporizador

  // Filtramos el show usando el ID de la URL
  const event = shows.find((show) => show.id === parseInt(id)); // Buscar evento por ID

  useEffect(() => {
    // Despachar la acción para obtener todos los eventos solo si aún no están cargados
    if (shows.length === 0) {
      dispatch(getShows());
    }
  }, [shows.length, dispatch]);

  useEffect(() => {
    if (timerStart) {
      const timer = setTimeout(() => {
        setTimerExpired(true);
        navigate('/'); // Redirige a Home después de 15 minutos
      }, 900000); // 15 minutos en milisegundos

      return () => clearTimeout(timer);
    }
  }, [timerStart, navigate]);

  const handleSelectSeat = (seat) => {
    setSelectedSeats((prev) => {
      if (prev.includes(seat)) {
        return prev.filter((s) => s !== seat); // Eliminar si ya está seleccionado
      }
      return [...prev, seat]; // Añadir si no está seleccionado
    });
  };

  const handleAcceptWarning = () => {
    setShowWarning(false); // Ocultar el mensaje de advertencia
    setTimerStart(true); // Iniciar el temporizador
    setIsModalOpen(true); // Abrir el modal para elegir asientos
  };

  const handleCloseModal = () => {
    setIsModalOpen(false); // Cerrar el modal de selección de asientos
  };

  const handleGoHome = () => {
    navigate('/'); // Redirige al home
  };

  const handleAcceptSeats = () => {
    // Aquí iría la lógica para redirigir al carrito de compras o algún otro proceso
    console.log("Asientos seleccionados:", selectedSeats);
    // Por ahora, simplemente cerramos el modal
    setIsModalOpen(false);
    // Navegar al carrito (puedes añadir el link real más adelante)
    // navigate('/carrito');
  };

  if (loading) {
    return <div>Loading...</div>;
  }

  if (error) {
    return <div>Error: {error}</div>;
  }

  return (
    <div className="event-detail">
      <h1>{event ? event.name : 'Evento no encontrado'}</h1>
      <p>{event && event.date}</p>
      <p>Price: ${event && event.price}</p>
      <p>City: {event && event.location}</p>

      {/* Mostrar el mensaje de advertencia si showWarning es true */}
      {showWarning && (
        <div className="warning-message">
          <p>You have 15 minutes to select your seats and complete the purchase..</p>
          <button onClick={handleAcceptWarning}>Aceptar</button>
        </div>
      )}

      {/* Mostrar el modal de selección de asientos si isModalOpen es true */}
      {isModalOpen && (
        <>
          {/* Fondo oscuro detrás del modal */}
          <div className="modal-overlay" onClick={handleCloseModal}></div>

          <div className="modal">
            <h2>Select your place</h2>
            <div className="seating-chart">
              {['A', 'B', 'C', 'D', 'E'].map((row, rowIndex) => (
                <div key={rowIndex} className="row">
                  {[1, 2, 3, 4, 5].map((seatNumber) => {
                    const seatId = `${seatNumber}${row}`; // Formato '1A', '2A', etc.
                    return (
                      <div
                        key={seatId}
                        className={`seat ${selectedSeats.includes(seatId) ? 'selected' : ''}`}
                        onClick={() => handleSelectSeat(seatId)}
                      >
                        {seatId}
                      </div>
                    );
                  })}
                </div>
              ))}
            </div>

            {/* Botón para aceptar los asientos seleccionados */}
            <button onClick={handleAcceptSeats}>Acept</button>
            <button onClick={handleCloseModal}>Close</button>
          </div>
        </>
      )}

      {/* Botón para volver al home */}
      <button className="back-home-btn" onClick={handleGoHome}>Return to Home</button>
    </div>
  );
};

export default Detail;
