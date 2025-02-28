import React from 'react';
import Swal from 'sweetalert2';
import { useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import "./seatbuy.css"

const Seatbuy = ({ seats, eventDetails, selectedSeats, zoneId, selectedPresentation }) => {
  const navigate = useNavigate();

  const user = useSelector((state) => state.user);
  
  if (!eventDetails) {
    return <p>Cargando datos del evento...</p>; // Muestra un mensaje mientras los datos se cargan
  }

  // Función para manejar la selección del asiento
  const handleSeatSelection = () => {
    const presentation = selectedPresentation;  // Asegúrate de que haya al menos una presentación

    
    
    if (presentation) {
      Swal.fire({
        title: `¿Deseas seleccionar el asiento ${seats.id} de la Fila ${seats.row}?`,
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
              price: seats.price,
              zoneId,
              showId: seats.showId,
              division: seats.division, // Añadir división
              
            },
              
            userId: user?.id,  // Cambiar por el ID del usuario autenticado si es necesario
            
            };
            
            Swal.fire({
              title: '¡Ticket generado!',
              text: `Has seleccionado el asiento ${seats.id} Fila ${seats.row} para el evento ${eventDetails.name} a las ${presentation.time.start} - ${presentation.time.end}.`,
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
     // Función para manejar el clic en el botón "Cerrar"
  const handleClose = () => {
    navigate('/'); // Redirige a la página principal
  };
 
    return (
      <div className='modal-contenido'>
        <h1 style={{color:"black"}}>{eventDetails?.name}</h1>
        <p><strong>Artista:</strong> {eventDetails?.artists.join(', ')}</p>
        <p><strong>Genero:</strong> {eventDetails?.genre.join(', ')}</p>
        <p><strong>Direccion:</strong> {eventDetails?.location}</p>
        
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
              <p><strong>Presentación:</strong> {presentation.performance}</p>
              <p><strong>Fecha:</strong> {selectedPresentation?.date}</p>
              <p><strong>Hora:</strong> {selectedPresentation?.time?.start} - {selectedPresentation?.time?.end}</p>
            </div>
          ))}
        </div>
  
        <button className='select-seats-btns' onClick={handleSeatSelection}>
          Seleccionar Asiento {seats.id}, Fila {seats.row}
        </button>
        {/* Botón "Cerrar" que lleva a la página principal */}
      <button className='close-btn' onClick={handleClose}>
        Cerrar
      </button>
      </div>
    );
  
  
  };
  
  export default Seatbuy;
           

          
            


