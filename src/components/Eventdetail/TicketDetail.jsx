import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import axios from 'axios';
import Swal from 'sweetalert2';
import { useSelector, useDispatch } from 'react-redux';
import { getShows } from '../Redux/Actions/actions';
import './ticketdetail.css';

const TicketDetail = () => {
  const user = useSelector((state) => state.user);
  const location = useLocation();
  const navigate = useNavigate();
  const shows = useSelector((state) => state.shows);
  const dispatch = useDispatch();

  // Ahora recibimos un array de tickets
  const { tickets } = location.state || JSON.parse(sessionStorage.getItem("ticketData")) || {};

  const [loadingShows, setLoadingShows] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [errorShows, setErrorShows] = useState(null);
  const [buyerData, setBuyerData] = useState({
    dni: '',
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
  });

  useEffect(() => {
    if (shows.length === 0) {
      dispatch(getShows())
        .then(() => setLoadingShows(false))
        .catch(() => {
          setErrorShows('Error al obtener los shows');
          setLoadingShows(false);
        });
    } else {
      setLoadingShows(false);
    }
  }, [dispatch, shows]);

  // Validación simple para no seguir si no hay tickets
  if (!tickets || tickets.length === 0) {
    return <p>Error: No hay tickets seleccionados.</p>;
  }

  // Sacamos el eventDetails del primer ticket para mostrar info general (asumiendo todos son del mismo evento)
  const eventDetails = tickets[0]?.eventDetails || {};

  const handleOpenBuyerModal = () => {
  const storedData = JSON.parse(sessionStorage.getItem('buyerData')) || buyerData;
  const { dni, firstName, lastName, email, phone } = storedData;

  Swal.fire({
    title: 'Debe cargar los datos del comprador',
     html: `
      <div style="padding: 24px; max-width: 400px; margin: auto; background-color: #2a378fff; border-radius: 10px; font-family: 'Inter', sans-serif;">
        <label style="display: block; font-weight: bold; color: white; margin-bottom: 8px;">DNI:</label>
        <input type="text" id="dni" value="${dni || ''}" style="width: 100%; padding: 10px; margin-bottom: 16px;" />
        <label style="display: block; font-weight: bold; color: white; margin-bottom: 8px;">Nombre:</label>
        <input type="text" id="firstName" value="${firstName || ''}" style="width: 100%; padding: 10px; margin-bottom: 16px;" />
        <label style="display: block; font-weight: bold; color: white; margin-bottom: 8px;">Apellido:</label>
        <input type="text" id="lastName" value="${lastName || ''}" style="width: 100%; padding: 10px; margin-bottom: 16px;" />
        <label style="display: block; font-weight: bold; color: white; margin-bottom: 8px;">Correo:</label>
        <input type="email" id="email" value="${email || ''}" style="width: 100%; padding: 10px; margin-bottom: 16px;" />
        <label style="display: block; font-weight: bold; color: white; margin-bottom: 8px;">Teléfono:</label>
        <input type="text" id="phone" value="${phone || ''}" style="width: 100%; padding: 10px;" />
        <button id="autoFillBtn" style="margin-top: 16px; background-color: #3949ab; color: white; padding: 10px 16px; border: none; border-radius: 5px; cursor: pointer;">
          Autocompletar con mis datos
        </button>
      </div>
    `,
    focusConfirm: false,
    showCancelButton: true,
    cancelButtonText: 'Borrar datos',
    didOpen: () => {
      // Agregar funcionalidad al botón "Autocompletar"
      document.getElementById('autoFillBtn').addEventListener('click', () => {
        const [first = '', last = ''] = (user?.name || '').split(' ');
        document.getElementById('firstName').value = first;
        document.getElementById('lastName').value = last;
        document.getElementById('email').value = user?.email || '';
        document.getElementById('dni').value = '';
        document.getElementById('phone').value = '';
      });
    },
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
      sessionStorage.setItem('buyerData', JSON.stringify(result.value));

      if (user?.cashier) {
  // Si es venta por caja, sin advertencia de MP
  handleConfirmPurchase(result.value, 'sell');
} else {
  // ⚠️ Solo mostrar si es compra con MP
  Swal.fire({
    title: '⚠️ Atención',
    html: `
      Una vez que su pago con <strong>MercadoPago</strong> se procese correctamente,<br>
      <b>debe esperar</b> la redirección automática para que su ticket se genere sin errores.<br><br>
      <span style="color: red; font-weight: bold;">
        Si interrumpe el proceso o cierra la ventana, perderá su ticket.
      </span>
    `,
    icon: 'warning',
    confirmButtonText: 'Entendido, Continuar al pago'
  }).then((confirmResult) => {
    if (confirmResult.isConfirmed) {
      handleConfirmPurchase(result.value, 'buy');
    }
  });
}

    } else if (result.dismiss === Swal.DismissReason.cancel) {
      sessionStorage.removeItem('buyerData');
      Swal.fire({
        title: 'Datos borrados',
        text: 'Los datos se han borrado, puedes ingresar nuevos.',
        icon: 'info',
        confirmButtonText: 'Aceptar',
      }).then(() => {
        handleOpenBuyerModal();
      });
    }
  });
};


  const handleConfirmPurchase = async (buyerDetails = null, action = 'buy') => {
   
    setIsLoading(true);

    // Aquí armamos un array con los asientos que se compran o venden
    // Si es asiento numerado, cada objeto debe tener showId, zoneId, division, row, seatId, price, etc.
    // Si es general, debes adaptar a la estructura que uses para general (aquí asumo asientos numerados)

    // Ejemplo: mapeamos tickets para armar un array para backend
    const ticketsPayload = tickets.map((ticket) => {
      const seat = ticket.selectedSeat;

      return {
        showId: seat.showId,
        zoneId: seat.zoneId,
        division: seat.division,
        row: seat.row,
        seatId: seat.id,
        price: seat.price,
        userId: user?.id,
        name: buyerDetails ? `${buyerDetails.firstName} ${buyerDetails.lastName}` : null,
        dni: buyerDetails?.dni || null,
        mail: buyerDetails?.email || null,
        phone: buyerDetails?.phone || null,
       
      };
    });
 

    // Elegimos el endpoint según acción
    const endpoint = '/tickets/sales';

    try {
  const serviceType = action === 'sell' ? 'CASH' : 'MP';

  const response = await axios.post(endpoint, {
    tickets: ticketsPayload,
    service: serviceType,
  });

  const ticketsResponse = response.data; // array de tickets retornados por el backend

  // Guardamos en sessionStorage
  sessionStorage.setItem("ticketData", JSON.stringify({ tickets: ticketsResponse }));

  // Si es compra y hay init_point (MercadoPago), redirigir
  if (response.data.init_point && action === 'buy') {
    window.location.href = response.data.init_point;
    return;
  }

  // Mostrar alerta de éxito
  Swal.fire({
    title: action === 'buy' ? 'Compra Confirmada' : 'Venta Confirmada',
    text: action === 'buy'
      ? 'El pago se ha completado con éxito.'
      : 'La venta se ha procesado con éxito',
    icon: 'success',
    confirmButtonText: 'Aceptar',
  });

  // Navegamos al /success con todos los tickets
  navigate('/success', {
    state: {
      tickets: ticketsResponse,
      mail: buyerDetails?.email,
      name: `${buyerDetails?.firstName} ${buyerDetails?.lastName}`,
      phone: buyerDetails?.phone,
    },
  });

  setIsLoading(false);
} catch (error) {
  console.error("Error en la compra/venta:", error);
  Swal.fire({
    title: 'Error',
    text: 'Hubo un error inesperado. Intenta nuevamente.',
    icon: 'error',
    confirmButtonText: 'Aceptar',
  });
  setIsLoading(false);
}
  };

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

  // Mostrar todos los asientos seleccionados
  return (
    <div className="ticket-container">
      <h1 className="className='font-bold text-black'ticket-title">Ticket de Evento</h1>

      <div className="ticket-box">
        <h2 className="className='font-bold text-black'">{eventDetails.name}</h2>
        <p className='font-bold text-black'><strong>Descripción:</strong> {eventDetails.description}</p>
        <p className='font-bold text-black'><strong>Dirección:</strong> {eventDetails.Direccion || eventDetails.location}</p>
        <p className='font-bold text-black'><strong>Fecha:</strong> {eventDetails.presentation?.date}</p>
        <p className='font-bold text-black'><strong>Hora de inicio:</strong> {eventDetails.presentation?.time?.start}</p>
        <p className='font-bold text-black'><strong>Hora de fin:</strong> {eventDetails.presentation?.time?.end}</p>
        <hr />

        <h3 className="seat-title">Detalles de los Asientos Seleccionados:</h3>
        {tickets.map((ticket, i) => (
          <div key={i} style={{ borderBottom: "1px solid #ccc", marginBottom: "10px" }}>
            <p className='font-bold text-black'><strong>División:</strong> {ticket.selectedSeat.division}</p>
            <p className='font-bold text-black'><strong>Asiento N°:</strong> {ticket.selectedSeat.id}</p>
            <p className='font-bold text-black'><strong>Fila:</strong> {ticket.selectedSeat.row}</p>
            <p className='font-bold text-black'><strong>Precio:</strong> ${ticket.selectedSeat.price}</p>
          </div>
        ))}

        <button className="p-2 rounded bg-[rgba(70,70,140,0.7)] border border-white text-white focus:outline-none focus:ring-2 focus:ring-blue-400" onClick={handleOpenBuyerModal}>
          Pagar compra
        </button>
      </div>
    </div>
  );
};

export default TicketDetail;
