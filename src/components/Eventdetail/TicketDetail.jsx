import React, { useState,useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import axios from 'axios';
import Swal from 'sweetalert2';
import { useSelector,useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom'; // Importamos useNavigate
import { getShows } from '../Redux/Actions/actions';
import './ticketdetail.css';


const TicketDetail = () => {
  const user = useSelector((state) => state.user);
  const location = useLocation();
  const {eventDetails,selectedSeat,selectedGeneral,selectedtribunes} = location.state || {};
  const navigate = useNavigate(); // Hook para redireccionar
  const shows = useSelector((state) => state.shows);
  const [loadingShows, setLoadingShows] = useState(true);
  const [isLoading, setIsLoading] = useState(false);  // Nuevo estado para cargar
  const [errorShows, setErrorShows] = useState(null);
  const dispatch = useDispatch();
  const ticket = location.state;
 
  useEffect(() => {
      if (shows.length === 0) {
        dispatch(getShows())
          .then(() => setLoadingShows(false))
          .catch((err) => {
            setErrorShows('Error al obtener los shows');
            setLoadingShows(false);
          });
      } else {
        setLoadingShows(false);
      }
    }, [dispatch, shows]);

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
    setIsLoading(true);  // Activar el loading cuando comience la compra/venta
    // Cambiar el endpoint dinámicamente dependiendo de si es compra o venta
    const endpoint = action === 'sell' ? '/tickets/sell' : '/tickets/buy';
  
    const ticketData = selectedGeneral
      ? {
          showId: eventDetails.id,
          division: selectedGeneral.division,
          seatsCount: selectedGeneral.seatsCount,
          totalPrice: selectedGeneral.totalPrice,
          Direccion: shows.find(show => show.id === ticket.showId)?.location || "direccion desconocida",
          userId: user?.id,
          user: {
          "cashier": user?.cashier
          },
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
        location: `Floresta`,
        Direccion: shows.find(show => show.id === ticket.showId)?.location || "direccion desconocida",
        userId: user?.id,
        user: {
          "cashier": user?.cashier
          },
        name: buyerDetails ? `${buyerDetails.firstName} ${buyerDetails.lastName}` : null,
        dni: buyerDetails?.dni || null,
        mail: buyerDetails?.email || null,
        phone: buyerDetails?.phone || null,
        };
  console.log(ticketData, "DATOS ENVIADOS AL BACK")
    try {
      const response = await axios.post(endpoint, ticketData);
  
      // Verificar la respuesta para depuración
      
  
      const { init_point, qrCode, date, showId, division, price, row, seat, location } = response.data;
  
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
          state: { qrCode, showId, division, price, date, seat, location, row, mail: buyerDetails?.email, name: `${buyerDetails?.firstName} ${buyerDetails?.lastName}`, phone: buyerDetails?.phone },
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
          state: { qrCode, showId, division, price, date, seat, location, row, mail: buyerDetails?.email, name: `${buyerDetails?.firstName} ${buyerDetails?.lastName}`, phone: buyerDetails?.phone },
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
        navigate('/success', { state: { qrCode, showId, division, price, location, date, seat, row, mail: buyerDetails?.email, name: `${buyerDetails?.firstName} ${buyerDetails?.lastName}`, phone: buyerDetails?.phone } }); // Asegurar que SIEMPRE redirige
        setIsLoading(false);  // Desactivar el loading cuando finalice la compra/venta
      } else {
        
      }
    } catch (error) {
      console.error("Error en la compra:", error);
      
    }
  
  };

  const showAdress = shows.find(show => show.id === ticket.showId)?.location|| "Show ";

  console.log(ticket,"Datos del tiket")
  console.log(showAdress,"Datos de la cosntante")

  if (loadingShows) {
    return <div className="loading">Cargando shows...</div>;
  }

  if (errorShows) {
    return <div className="error">{errorShows}</div>;
  }
   
  if (isLoading) {
    return (
      <div className="loading-overlay">
        <div className="corner-img top-left" style={{ backgroundImage: 'url(/images/solticket.png)' }}></div>
        <div className="corner-img top-right" style={{ backgroundImage: 'url(/images/solticket.png)' }}></div>
        <div className="corner-img bottom-left" style={{ backgroundImage: 'url(/images/solticket.png)' }}></div>
        <div className="corner-img bottom-right" style={{ backgroundImage: 'url(/images/solticket.png)' }}></div>
  
        <div className="spinner"></div>
        <p>Procesando su compra...</p>
      </div>
    );
  }
  return (
    <div className="ticket-container">
      <h1 className="ticket-title">Ticket de Evento</h1>

      <div className="ticket-box">
        <h2 className="event-name">{eventDetails.name}</h2>
        <p>
          <strong>Descripción:</strong> {eventDetails.description}
        </p>
        <p>
          <strong>Dirección:</strong> {eventDetails.Direccion}
        </p>
        <p>
          <strong>Fecha:</strong> {eventDetails.presentation?.date}
        </p>
        <p>
          <strong>Ubicación:</strong> Floresta
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
            <h3 className="seat-title">Detalles del Asiento:</h3>
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
            <h3 className="seat-title">Detalles de la Selección:</h3>
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

        <div className="button-container">
          <button onClick={handleOpenBuyerModal} className="buy-button">
            {user?.cashier ? 'Vender Entrada' : 'Comprar Entrada'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default TicketDetail;
