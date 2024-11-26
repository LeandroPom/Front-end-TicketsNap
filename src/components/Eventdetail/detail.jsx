import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import '../Eventdetail/detail.css';

const Detail = () => {
  const { id } = useParams(); // Obtener el ID del evento desde la URL
  const navigate = useNavigate(); // Usar el hook navigate para redirigir a otras rutas

  const [event, setEvent] = useState(null); // Almacenará los datos del evento
  const [selectedSeats, setSelectedSeats] = useState([]); // Asientos seleccionados
  const [isModalOpen, setIsModalOpen] = useState(false); // Si el modal está abierto
  const [showWarning, setShowWarning] = useState(true); // Para mostrar el mensaje de advertencia
  const [timerExpired, setTimerExpired] = useState(false); // Para manejar la expiración del temporizador
  const [timerStart, setTimerStart] = useState(false); // Para iniciar el temporizador

  // Datos simulados del evento
  const eventDetails = {
    1: { name: 'Concierto de Rock', date: '2024-12-15', price: 50, city: 'Madrid' },
    2: { name: 'Teatro Musical', date: '2024-12-20', price: 40, city: 'Barcelona' },
    3: { name: 'Fútbol', date: '2024-12-10', price: 30, city: 'Valencia' },
  };

  useEffect(() => {
    // Cargar la información del evento seleccionado
    setEvent(eventDetails[id]);
  }, [id]);

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

  return (
    <div className="event-detail">
      <h1>{event ? event.name : 'Cargando evento...'}</h1>
      <p>{event && event.date}</p>
      <p>Precio: ${event && event.price}</p>
      <p>Ciudad: {event && event.city}</p>

      {/* Mostrar el mensaje de advertencia si showWarning es true */}
      {showWarning && (
        <div className="warning-message">
          <p>Tienes 15 minutos para seleccionar tus asientos y finalizar la compra.</p>
          <button onClick={handleAcceptWarning}>Aceptar</button>
        </div>
      )}

      {/* Mostrar el modal de selección de asientos si isModalOpen es true */}
      {isModalOpen && (
        <>
          {/* Fondo oscuro detrás del modal */}
          <div className="modal-overlay" onClick={handleCloseModal}></div>

          <div className="modal">
            <h2>Selecciona tus asientos</h2>
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
            <button onClick={handleAcceptSeats}>Aceptar</button>
            <button onClick={handleCloseModal}>Cerrar</button>
          </div>
        </>
      )}

      {/* Botón para volver al home */}
      <button className="back-home-btn" onClick={handleGoHome}>Volver a Home</button>
    </div>
  );
};

export default Detail;
