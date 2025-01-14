import React from 'react';
import Swal from 'sweetalert2';
import { useNavigate } from 'react-router-dom';

const Seatbuy = ({ seats, eventDetails, selectedSeats, seatselect }) => {
  const navigate = useNavigate();

  console.log(seats, " datos de visision q necesito")
  // Asegúrate de que 'event' no esté vacío o undefined antes de usarlo
  if (!eventDetails) {
    return <p>Cargando datos del evento...</p>; // Muestra un mensaje mientras los datos se cargan
  }

  // console.log(eventDetails, "DETALLES EVENTO DE SEATBUY");

  // Función para manejar la selección del asiento
  const handleSeatSelection = () => {
    const presentation = eventDetails?.presentation?.[0];  // Asegúrate de que haya al menos una presentación
  
    if (presentation) {
      Swal.fire({
        title: `¿Deseas seleccionar el asiento ${seats.id}?`,
        icon: 'question',
        showCancelButton: true,
        confirmButtonText: 'Sí',
        cancelButtonText: 'No',
      }).then((result) => {
        if (result.isConfirmed) {
          const ticket = {
            eventDetails: {
              name: eventDetails?.name,
              description: eventDetails?.description,
              // location: "Floresta",
              presentation: eventDetails?.presentation,
            },
            selectedSeat: {
              id: seats.id,
              row: seats.row,
              price: seats.rowPrice, 
              zoneId: seats.zoneId,   // Añadir zona
              showId: seats.showId,
              division: seats.division, // Añadir división
            },
            userId: 1,  // Cambiar por el ID del usuario autenticado si es necesario
          };

          console.log(ticket, " DATOS DEL TIKET")
  
          Swal.fire({
            title: '¡Ticket generado!',
            text: `Has seleccionado el asiento ${seats.id} para el evento ${eventDetails.name} a las ${presentation.time.start} - ${presentation.time.end}.`,
            icon: 'success',
          });
  
          navigate('/ticket-detail', {
            state: ticket,  // Pasamos todo el objeto ticket
          });
        }
      });
    } else {
      Swal.fire({
        title: 'Error',
        text: 'No se encontró la presentación del evento.',
        icon: 'error',
      });
    }
  };

  return (
    <div className="seat-buy-container">
      <h1>{eventDetails?.name}</h1>
      <p><strong>Artists:</strong> {eventDetails?.artists.join(', ')}</p>
      <p><strong>Genres:</strong> {eventDetails?.genre.join(', ')}</p>
      <p><strong>Location:</strong> Floresta</p>
      <p><strong>Address:</strong> Jujuy 200</p>
      <img className="event-image" src={eventDetails?.coverImage} alt={eventDetails?.name} style={{ width: '100%', height: 'auto' }} />

      <div className="presentations">
        {eventDetails?.presentation?.map((presentation, index) => (
          <div key={index} className="presentation">
            <p><strong>Date:</strong> {presentation.date}</p>
            <p><strong>Performance:</strong> {presentation.performance}</p>
            <p><strong>Time:</strong> {presentation.time.start} - {presentation.time.end}</p>
          </div>
        ))}
      </div>

      <button onClick={handleSeatSelection}>
        Seleccionar Asiento {seats.id}
      </button>
    </div>
  );


};

export default Seatbuy;
