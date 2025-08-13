import React, { useState, useEffect } from 'react';
import Swal from 'sweetalert2';
import { useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import "./seatbuy.css"

const Seatbuy = ({ selectedSeats: initialSelectedSeats, eventDetails, zoneId, selectedPresentation }) => {
  const navigate = useNavigate();
  const user = useSelector((state) => state.user);

  // Estado local para manejar los asientos seleccionados y poder modificarlos (quitar asientos)
  const [selectedSeats, setSelectedSeats] = useState(initialSelectedSeats || []);

  useEffect(() => {
    // Sincronizar si cambian los props de selectedSeats
    setSelectedSeats(initialSelectedSeats || []);
  }, [initialSelectedSeats]);

  const handleClose = () => {
    navigate('/');
  };

 const handleRemoveSeat = (seatUniqueId) => {
  const updatedSeats = selectedSeats.filter(seat =>
    (seat.uniqueId || `${seat.row}-${seat.id}`) !== seatUniqueId
  );
  setSelectedSeats(updatedSeats);

  if (updatedSeats.length === 0) {
    handleClose();
  }
};

  if (!eventDetails) {
    return <p>Cargando datos del evento...</p>;
  }

  const handleSeatSelection = () => {
    if (!selectedPresentation) {
      Swal.fire({
        title: 'Error',
        text: 'No se encontró la presentación del evento.',
        icon: 'error',
      });
      return;
    }

    if (selectedSeats.length === 0) {
      Swal.fire({
        title: 'Error',
        text: 'No hay asientos seleccionados para comprar.',
        icon: 'warning',
      });
      return;
    }

    Swal.fire({
      title: `¿Deseas confirmar la compra de ${selectedSeats.length} asiento(s)?`,
      icon: 'question',
      showCancelButton: true,
      confirmButtonText: 'Sí',
      cancelButtonText: 'No',
    }).then((result) => {
      if (result.isConfirmed) {
        // Aquí podrías armar un array de tickets o un solo ticket con múltiples asientos
        const tickets = selectedSeats.map(seat => ({
          eventDetails: {
            name: eventDetails.name,
            description: eventDetails.description,
            Direccion: eventDetails.location,
            presentation: selectedPresentation,
          },
          selectedSeat: {
            id: seat.id,
            row: seat.row,
            price: seat.price,
            zoneId,
            showId: seat.showId,
            division: seat.division,
          },
          userId: user?.id,
        }));

        Swal.fire({
          title: '¡Compra confirmada!',
          text: `Has comprado ${selectedSeats.length} asiento(s) para el evento ${eventDetails.name}.`,
          icon: 'success',
        });

        navigate('/ticket-detail', {
          state: { tickets },
        });
      }
    });
  };

  return (
    <div className="w-full  min-h-screen py-8 px-4 text-white"
    style={{ backgroundColor: 'rgba(55, 55, 107, 1)' }}
    >
      <div className="flex flex-col items-center text-center space-y-4">
        <h1 className="text-2xl font-bold text-white">{eventDetails?.name}</h1>

        <p className="text-white"><strong>Artista:</strong> {eventDetails?.artists.join(', ')}</p>
        <p className="text-white"><strong>Género:</strong> {eventDetails?.genre.join(', ')}</p>
        <p className="text-white"><strong>Dirección:</strong> {eventDetails?.location}</p>

        {eventDetails.coverImage.includes("youtube.com") || eventDetails.coverImage.includes("youtu.be") ? (
          <div className="w-full flex justify-center">
            <iframe
              className="w-full max-w-xl h-64 md:h-72 rounded-md shadow-md"
              src={eventDetails.coverImage.replace("watch?v=", "embed/")}
              title={eventDetails.name}
              frameBorder="0"
              allowFullScreen
            />
          </div>
        ) : (
          <img
            className="w-full max-w-xl h-auto rounded-md shadow-md"
            src={eventDetails.coverImage}
            alt={eventDetails.name}
          />
        )}

       

        <div className="w-full max-w-xl text-left space-y-2 mt-6"
        style={{ backgroundColor: 'rgba(55, 55, 107, 1)' }}
        >
          {eventDetails?.presentation?.map((presentation, index) => (
            <div key={index} className=" border rounded-md p-4"
            style={{ backgroundColor: 'rgba(55, 55, 107, 1)' }}
            >
              <p><strong>Presentación:</strong> {presentation.performance}</p>
              <p><strong>Fecha:</strong> {selectedPresentation?.date}</p>
              <p><strong>Hora:</strong> {selectedPresentation?.time?.start} - {selectedPresentation?.time?.end}</p>
            </div>
          ))}
        </div>

        <div className="w-full max-w-xl mt-6 text-left">
          <h3 className="text-lg font-semibold mb-2">Asientos seleccionados:</h3>
           <ul className="list-disc pl-6 space-y-1 text-gray-800">
          {selectedSeats.map(seat => {
  const seatKey = seat.uniqueId || `${seat.row}-${seat.id}`;
  return (
    <li key={seatKey} className="text-white flex items-center justify-between"
    style={{ backgroundColor: 'rgba(55, 55, 107, 1)' }}
    >
      <span>
        Asiento {seat.id}, Fila {seat.row} — <span className="font-medium text-white-600">${seat.price}</span>
      </span>
      <button
        onClick={() => handleRemoveSeat(seatKey)}
        className="ml-4 text-red-500 hover:text-red-700 font-bold"
        aria-label={`Eliminar asiento ${seat.id}`}
      >
        ✖
      </button>
    </li>
  );
})}
        </ul>
        </div>
{selectedSeats.length > 0 && (
  <div className="mt-4 text-white">
    <p><strong>Total:</strong> ${selectedSeats.reduce((acc, seat) => acc + seat.price, 0).toFixed(2)}</p>
    <p style={{ color: 'red' }}>
      <strong>Recargo de servicios:</strong> ${(
        selectedSeats.reduce((acc, seat) => acc + seat.price, 0) * 0.2
      ).toFixed(2)}
    </p>
  </div>
)}
        <div className="flex flex-col md:flex-row gap-4 mt-6">
          <button
            onClick={handleSeatSelection}
            className="text-white px-6 py-3 rounded-md font-semibold hover:bg-purple-700 transition"
            style={{ backgroundColor: 'rgba(68, 68, 109, 1)' }}
          >
            Confirmar compra de {selectedSeats.length} asiento(s)
          </button>
          <button
            onClick={handleClose}
            className="text-white px-6 py-3 rounded-md font-semibold hover:bg-purple-600 transition"
            style={{ backgroundColor: 'rgba(68, 68, 109, 1)' }}
          >
            Cerrar
          </button>
        </div>
      </div>
    </div>
  );
};

export default Seatbuy;
