import React from 'react';
import Swal from 'sweetalert2';
import { useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';

const Seatbuy = ({ seats, eventDetails, selectedSeats, seatselect, selectedPresentation }) => {
  const navigate = useNavigate();

  const user = useSelector((state) => state.user);

  // console.log(seats, " datos de visision q necesito")
  // console.log(user, " id del usuario")
  // Asegúrate de que 'event' no esté vacío o undefined antes de usarlo
  if (!eventDetails) {
    return <p>Cargando datos del evento...</p>; // Muestra un mensaje mientras los datos se cargan
  }

  // console.log(eventDetails, "DETALLES EVENTO DE SEATBUY");

  // Función para manejar la selección del asiento
  const handleSeatSelection = () => {
    const presentation = selectedPresentation;  // Asegúrate de que haya al menos una presentación

    // console.log(presentation, "PRESENTACION SEATBUY")
    
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
              Direccion: eventDetails.location,
              presentation: selectedPresentation
            },
            selectedSeat: {
              id: seats.id,
              row: seats.row,
              price: seats.rowPrice, 
              zoneId: seats.zoneId,   // Añadir zona
              showId: seats.showId,
              division: seats.division, // Añadir división
            },
            userId: user?.id,  // Cambiar por el ID del usuario autenticado si es necesario
            
            // Añadir los detalles de la presentación
            // presentationDetails: {
            //   date: presentation.date,
            //   time: presentation.time,  // Aquí tienes el objeto con start y end time
            // }
          };
  
          
  
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
      <p><strong>Location/Address:</strong> {eventDetails?.location}</p>
      
        {/* Verifica si la URL es de YouTube para renderizar un iframe en lugar de una imagen */}
        {eventDetails.coverImage.includes("youtube.com") || eventDetails.coverImage.includes("youtu.be") ? (
                <iframe 
                 className="event-video"
                 src={eventDetails.coverImage.replace("watch?v=", "embed/")} 
                 title={eventDetails.name}
                 frameBorder="0"
                 allowFullScreen
               ></iframe>
                 ) : (
                <img className="event-image" src={eventDetails.coverImage} alt={eventDetails.name} />
                )}

      <div className="presentations">
        {eventDetails?.presentation?.map((presentation, index) => (
          <div key={index} className="presentation">
            {/* <p><strong>Date:</strong> {presentation.date}</p> */}
            <p><strong>Performance:</strong> {presentation.performance}</p>
            <p><strong>Date:</strong> {selectedPresentation?.date}</p>
            <p><strong>Time:</strong> {selectedPresentation?.time?.start} - {selectedPresentation?.time?.end}</p>
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
