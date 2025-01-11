import React from 'react';
import { useLocation } from 'react-router-dom';
import { QRCodeCanvas } from 'qrcode.react'; // Usa QRCodeCanvas
import axios from 'axios'; // Para hacer la petición HTTP
import Swal from 'sweetalert2'; // Importa SweetAlert2

const TicketDetail = () => {
  const location = useLocation();
  const { eventDetails, selectedSeat,selectedSeats, selectedZone, ticket, seats } = location.state || {};

  if (!eventDetails || !selectedSeat) {
    return <p>Error: No hay datos disponibles para este ticket.</p>;
  }
console.log(selectedSeat, " ver datos q recibo desde buy")
  // Crear una cadena de texto con los datos para el QR
  const qrData = `Evento: ${eventDetails.name}
Descripción: ${eventDetails.description}
Fecha: ${eventDetails.presentation[0].date}
Ubicación: "Floresta", "Jujuy 200"
Hora de inicio: ${eventDetails.presentation[0]?.time?.start}
Hora de fin: ${eventDetails.presentation[0]?.time?.end}
Performance: ${eventDetails.presentation[0]?.performance}
Fila: ${selectedSeat.row}
Precio: $${selectedSeat.price}
`;

  // Función para enviar los datos al backend
  const handleConfirmPurchase = async () => {
    const ticketData = {
      showId: selectedSeat.showId,
      zoneId: selectedSeat?.zoneId,
      division: selectedSeat?.division,
      row: selectedSeat?.row,
      seatId: selectedSeat?.id,
      price: selectedSeat?.price,
      // description: eventDetails.description,
      // date: eventDetails.presentation[0].date,
      location: `${"Floresta"}, ${"Jujuy 200"}`,
      // startTime: eventDetails.presentation[0]?.time?.start,
      // endTime: eventDetails.presentation[0]?.time?.end,
      // performance: eventDetails.presentation[0]?.performance,
      // seatId: selectedSeat.id,
      // seatPrice: selectedSeat.price,
      userId: 1, // Cambia esto para obtener el ID del usuario autenticado.
      // taken: true,
      user: {
        "cashier": true
      }
    };

    console.log(ticketData, " datos a enviar al backend")

    try {
      const response = await axios.post('http://localhost:3001/tickets/sell', ticketData);
      console.log('Ticket comprado con éxito:', response.data);


       // SweetAlert para confirmar la compra
    Swal.fire({
      title: 'Compra finalizada con éxito',
      text: 'Tu ticket ha sido generado correctamente.',
      icon: 'success',
      confirmButtonText: 'Aceptar',
    }).then((result) => {
      if (result.isConfirmed) {
        // Redirige al home al confirmar
        window.location.href = '/';
      }
    });
    } catch (error) {
      console.error('Error al procesar la compra:', error);
    }
  };

  return (
    <div style={{ textAlign: 'center', marginTop: '80px' }}>
      <h1>Ticket de Evento</h1>
  
      <div
        style={{
          border: '1px solid black',
          padding: '20px',
          display: 'inline-block',
          textAlign: 'left',
        }}
      >
        <h2>{eventDetails.name}</h2>
        <p><strong>Descripción:</strong> {eventDetails.description}</p>
        <p><strong>Fecha:</strong> {eventDetails.presentation[0].date}</p>
        <p><strong>Ubicación:</strong> Floresta, Jujuy200</p>
        <p><strong>Hora de inicio:</strong> {eventDetails.presentation[0]?.time?.start}</p>
        <p><strong>Hora de fin:</strong> {eventDetails.presentation[0]?.time?.end}</p>
        <p><strong>Performance:</strong> {eventDetails.presentation[0]?.performance}</p>
        <hr />
        <h3>Detalles del Asiento :</h3>
        <p><strong>Numero:</strong> {selectedSeat.id}</p>
        <p><strong>Fila:</strong> {selectedSeat.row}</p>
        <p><strong>Precio:</strong> ${selectedSeat.price}</p>
  
        {/* Contenedor para QR y botón */}
        <div style={{ marginBottom: '40px' }}>
          {/* Mostrar el QR */}
          <QRCodeCanvas value={qrData} size={200} style={{ marginBottom: '20px', marginLeft: "83px" }} />
  
          {/* Botón de Confirmar Compra */}
          <button
            onClick={handleConfirmPurchase}
            style={{
              padding: '10px 20px',
              fontSize: '16px',
              backgroundColor: '#4CAF50',
              color: 'white',
              border: 'none',
              borderRadius: '5px',
              cursor: 'pointer',
              marginLeft: 'auto',
              marginRight: 'auto',
              display: 'block', // Esto asegura que el botón se centre en el contenedor
            }}
          >
            Confirmar Compra
          </button>
        </div>
      </div>
    </div>
  );
};



export default TicketDetail;
