import React, { useState } from 'react';
import { useLocation } from 'react-router-dom';
import axios from 'axios';
import Swal from 'sweetalert2';
import { useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom'; // Importamos useNavigate

const TicketDetail = () => {
  const user = useSelector((state) => state.user);
  const location = useLocation();
  const { eventDetails, selectedSeat, selectedGeneral, selectedtribunes } = location.state || {};
  const navigate = useNavigate(); // Hook para redireccionar

  const [buyerData, setBuyerData] = useState({
    dni: '',
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
  });

  if (!eventDetails || (!selectedSeat && !selectedGeneral && !selectedtribunes)) {
    return <p>Error: No hay datos disponibles para este ticket.</p>;
  }

  console.log(user, "usuario id")

  const handleOpenBuyerModal = () => {
    Swal.fire({
      title: 'Debe cargar los datos del comprador',
      html: `
        <div>
          <label>DNI:</label><br/>
          <input type="text" id="dni" class="swal2-input" placeholder="Ingrese el DNI"/>
          <label>Nombre:</label><br/>
          <input type="text" id="firstName" class="swal2-input" placeholder="Ingrese el nombre"/>
          <label>Apellido:</label><br/>
          <input type="text" id="lastName" class="swal2-input" placeholder="Ingrese el apellido"/>
          <label>Correo:</label><br/>
          <input type="email" id="email" class="swal2-input" placeholder="Ingrese el correo"/>
          <label>Teléfono:</label><br/>
          <input type="text" id="phone" class="swal2-input" placeholder="Ingrese el teléfono"/>
        </div>
      `,
      focusConfirm: false,
      preConfirm: () => {
        const dni = document.getElementById('dni').value;
        const firstName = document.getElementById('firstName').value;
        const lastName = document.getElementById('lastName').value;
        const email = document.getElementById('email').value;
        const phone = document.getElementById('phone').value;

        if (!dni || !firstName || !lastName || !email || !phone) {
          Swal.showValidationMessage('Todos los campos son obligatorios');
          return null;
        }

        return { dni, firstName, lastName, email, phone };
      },
    }).then((result) => {
      if (result.isConfirmed) {
        setBuyerData(result.value);
        handleConfirmPurchase(result.value, user?.cashier ? 'sell' : 'buy');
      }
    });
  };

  const handleConfirmPurchase = async (buyerDetails = null, action = 'buy') => {
    // Cambiar el endpoint dinámicamente dependiendo de si es compra o venta
    const endpoint = action === 'sell' ? '/tickets/sell' : '/tickets/buy';
  
    const ticketData = selectedGeneral
      ? {
          showId: eventDetails.id,
          division: selectedGeneral.division,
          seatsCount: selectedGeneral.seatsCount,
          totalPrice: selectedGeneral.totalPrice,
          userId: user?.id,
          cashier: user?.cashier,
          name: buyerDetails ? `${buyerDetails.firstName} ${buyerDetails.lastName}` : null,
          dni: buyerDetails?.dni || null,
          mail: buyerDetails?.email || null,
          phone: buyerDetails?.phone || null,
        }
      : {
          showId: selectedSeat.showId,
          zoneId: selectedSeat?.zoneId,
          division: selectedSeat?.division,
          row: selectedSeat?.row,
          seatId: selectedSeat?.id,
          price: selectedSeat?.price,
          location: `Floresta, Jujuy 200`,
          userId: user?.id,
          cashier: user?.cashier,
          name: buyerDetails ? `${buyerDetails.firstName} ${buyerDetails.lastName}` : null,
          dni: buyerDetails?.dni || null,
          mail: buyerDetails?.email || null,
          phone: buyerDetails?.phone || null,
        };
  
    try {
      const response = await axios.post(endpoint, ticketData);
  
      // Verificar la respuesta para depuración
      
  
      const { init_point, ticketId, state, totalAmount, qrCode, date, showId, division, price, row, seat } = response.data;
  
      if (init_point) {
        // Si es una compra, redirigir al usuario a MercadoPago
        window.location.href = init_point;
      } else if (action === 'buy') {
        // Para compras exitosas, mostrar el ticket con detalles
        Swal.fire({
          title: 'Compra Confirmada',
          text: `El pago se ha completado con éxito.`,
          icon: 'success',
          confirmButtonText: 'Aceptar',
        });
        // Redirigir al success page con los detalles del ticket
        navigate('/success', {
          state: { qrCode, showId, division, price, date, seat, row, mail: buyerDetails?.email, name: `${buyerDetails?.firstName} ${buyerDetails?.lastName}`, phone: buyerDetails?.phone },
        });
      } else if (action === 'sell') {
        // Para ventas en efectivo, mostrar confirmación sin MercadoPago
        Swal.fire({
          title: 'Venta Confirmada',
          text: `La venta se ha procesado con éxito`,
          icon: 'success',
          confirmButtonText: 'Aceptar',
        });
        // Redirigir a la página de éxito con el ticket generado
        navigate('/success', {
          state: { qrCode, showId, division, price, date, seat, row, mail: buyerDetails?.email, name: `${buyerDetails?.firstName} ${buyerDetails?.lastName}`, phone: buyerDetails?.phone },
        });
      } else {
        // Si no se recibe un 'init_point' ni un 'ticketId', significa que hubo un error
        Swal.fire({
          title: 'Error',
          text: 'Hubo un problema al procesar la compra/venta. Intenta nuevamente.',
          icon: 'error',
          confirmButtonText: 'Aceptar',
        });
      }
      if (response.success) {
        navigate('/success', { state: { qrCode, showId, division, price, date, seat, row, mail: buyerDetails?.email, name: `${buyerDetails?.firstName} ${buyerDetails?.lastName}`, phone: buyerDetails?.phone } }); // Asegurar que SIEMPRE redirige
      } else {
        alert("Error al procesar la compra.");
      }
    } catch (error) {
      console.error("Error en la compra:", error);
      alert("Hubo un problema al procesar la compra.");
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
        <p>
          <strong>Descripción:</strong> {eventDetails.description}
        </p>
        <p>
          <strong>Fecha:</strong> {eventDetails.presentation?.date}
        </p>
        <p>
          <strong>Ubicación:</strong> Floresta, Jujuy 200
        </p>
        <p>
          <strong>Hora de inicio:</strong> {eventDetails.presentation?.time?.start}
        </p>
        <p>
          <strong>Hora de fin:</strong> {eventDetails.presentation?.time?.end}
        </p>
        <hr />

        {selectedSeat ? (
          <>
            <h3>Detalles del Asiento:</h3>
            <p>
              <strong>División:</strong> {selectedSeat.division}
            </p>
            <p>
              <strong>Asiento N°:</strong> {selectedSeat.id}
            </p>
            <p>
              <strong>Fila N°:</strong> {selectedSeat.row}
            </p>
            <p>
              <strong>Precio:</strong> ${selectedSeat.price}
            </p>
          </>
        ) : (
          <>
            <h3>Detalles de la Selección:</h3>
            <p>
              <strong>División:</strong> {selectedGeneral.division}
            </p>
            <p>
              <strong>Boletos seleccionados:</strong> {selectedGeneral.seatsCount}
            </p>
            <p>
              <strong>Total a pagar:</strong> ${selectedGeneral.totalPrice}
            </p>
          </>
        )}

        <div style={{ marginBottom: '40px' }}>
          <button
            onClick={handleOpenBuyerModal} // Siempre abre el modal de datos
            style={{
              padding: '10px 20px',
              fontSize: '16px',
              backgroundColor: '#4CAF50',
              color: 'white',
              border: 'none',
              borderRadius: '5px',
              cursor: 'pointer',
              margin: 'auto',
            }}
          >
            {user?.cashier ? 'Vender Entrada' : 'Comprar Entrada'} {/* Esto solo cambia el texto */}
          </button>
        </div>
      </div>
    </div>
  );
};

export default TicketDetail;
