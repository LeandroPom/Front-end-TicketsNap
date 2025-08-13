import React, { useEffect, useState, useRef } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { getShows } from '../Redux/Actions/actions';
import emailjs from 'emailjs-com';
import axios from 'axios';
import Swal from 'sweetalert2';
import jsPDF from 'jspdf';
import styles from './succesbuy.css';

const SuccessPage = () => {
  const location = useLocation();
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const user = useSelector(state => state.user);
  const shows = useSelector(state => state.shows);

  const [tickets, setTickets] = useState(() => {
    if (location.state && Array.isArray(location.state.tickets)) {
      return location.state.tickets;
    }
    return [];
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [sendTo, setSendTo] = useState('');
  const [customEmail, setCustomEmail] = useState('');
  const [showCustomEmailInput, setShowCustomEmailInput] = useState(false);

  const [currentPage, setCurrentPage] = useState(1);
  const ticketsPerPage = 2;
  const indexOfLastTicket = currentPage * ticketsPerPage;
  const indexOfFirstTicket = indexOfLastTicket - ticketsPerPage;
  const currentTickets = tickets.slice(indexOfFirstTicket, indexOfLastTicket);
  const totalPages = Math.ceil(tickets.length / ticketsPerPage);

  // Ref para controlar que solo haga la llamada una vez
  const didFetchTickets = useRef(false);

  // Primer useEffect para cargar shows si no están
  useEffect(() => {
    console.log('Dispatch getShows desde primer useEffect');
    if (shows.length === 0) {
      dispatch(getShows());
    }
  }, [dispatch, shows.length]);

  // Segundo useEffect para cargar tickets, cuando user y shows estén listos
  useEffect(() => {
  if (didFetchTickets.current) return;
  if (!user || !user.id) return;
  if (shows.length === 0) return;

  if (location.state && Array.isArray(location.state.tickets) && location.state.tickets.length > 0) {
    // Si ya tenemos tickets en location.state, los usamos, no hacemos fetch
    setLoading(false);
    didFetchTickets.current = true;
    setTickets(location.state.tickets);
    return;
  }

  didFetchTickets.current = true;

  Swal.fire({
    title: '¡Felicidades por tu compra!',
    text: 'Procesando ticket...',
    icon: 'success',
    confirmButtonText: 'OK'
  }).then(() => {
    setLoading(true);
    axios.get('/payments/tickets')
      .then(response => {
        let data = response.data;
        if (data && data.tickets && Array.isArray(data.tickets)) {
          data = data.tickets.flat();
        } else if (Array.isArray(data)) {
          data = data.flat();
        } else {
          data = [];
        }
        const filteredTickets = data.filter(ticket =>
          ticket.userId === user.id ||
          ticket.buyerId === user.id ||
          ticket.user_id === user.id
        );
        setTickets(filteredTickets);
        setError(null);
      })
      .catch(error => {
        console.error('Error al obtener tickets:', error);
        setError('Error al obtener tickets');
      })
      .finally(() => {
        setLoading(false);
      });
  });
}, [user, shows, location.state]);


  const handlePrevPage = () => {
    if (currentPage > 1) setCurrentPage(currentPage - 1);
  };

  const handleNextPage = () => {
    if (currentPage < totalPages) setCurrentPage(currentPage + 1);
  };

  const sendTicketEmail = (ticket) => {
    const templateParams = {
      to_email: sendTo === 'custom' ? customEmail : sendTo,
      from_name: 'Tu Plataforma de Ventas',
      name: ticket.name,
      email: ticket.mail,
      phone: ticket.phone,
      date: ticket.date,
      division: ticket.division,
      seat: ticket.seat,
      row: ticket.row,
      price: ticket.price,
      show: shows.find(show => show.id === ticket.showId)?.name || "Show desconocido",
      qrCode: ticket.qrCode,
      Direccion: ticket.location,
    };

    emailjs.send(
      'service_72a1029',
      'template_dl2ctup',
      templateParams,
      '5DeCesBmnqWIqrrla'
    )
    .then(() => alert('Correo enviado correctamente!'))
    .catch(error => {
      console.error('Error al enviar el correo:', error);
      alert('Hubo un problema al enviar el correo.');
    });
  };

  const handleEmailChange = (event) => {
    setCustomEmail(event.target.value);
  };

  const handleSendToChange = (event) => {
    setSendTo(event.target.value);
    setShowCustomEmailInput(event.target.value === 'custom');
  };

  const downloadPDF = (ticket) => {
    const priceWithTax = ticket.price * 1.2;
    const doc = new jsPDF();

    doc.setFontSize(16);
    doc.text(`Nombre: ${ticket.name}`, 10, 10);
    doc.text(`Email: ${ticket.mail || "Correo no disponible"}`, 10, 20);
    doc.text(`Teléfono: ${ticket.phone}`, 10, 30);
    doc.text(`Fecha y Hora: ${ticket.date}`, 10, 40);
    doc.text(`División: ${ticket.division}`, 10, 50);
    doc.text(`Asiento: ${ticket.seat || "No asignado"}`, 10, 60);
    doc.text(`Fila: ${ticket.row || "No asignada"}`, 10, 70);
    doc.text(`Precio: ${priceWithTax.toFixed(2) || "No disponible"}`, 10, 80);
    doc.text(`Evento: ${shows.find(show => show.id === ticket.showId)?.name || "Show desconocido"}`, 10, 90);
    doc.text(`Dirección: ${ticket.location}`, 10, 100);

    const qrImg = new Image();
    qrImg.src = ticket.qrCode;
    qrImg.onload = function() {
      doc.addImage(qrImg, 'JPEG', 10, 110, 80, 80);
      doc.save(`ticket_${ticket.id || 'download'}.pdf`);
    };
  };

  if (loading) {
    return <div className="loading">Cargando datos...</div>;
  }

  if (error) {
    return <div className="error">{error}</div>;
  }

  if (!tickets || tickets.length === 0) {
    return <p>Datos del ticket no disponibles.</p>;
  }

  return (
    <div className="p-6">
      <h1 className=" mt-[180px] text-3xl font-bold mb-6 text-center">Compra Exitosa</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 justify-items-center mt-[90px]">
        {currentTickets.map((ticket) => {
          const priceWithTax = ticket.price * 1.2;
          const showName = shows.find(show => show.id === ticket.showId)?.name || "Show desconocido";

          return (
            <div
              key={ticket.id}
              className="bg-white border border-gray-300 rounded-lg shadow-md p-4 w-full max-w-md flex flex-col justify-between"
              style={{ minHeight: '320px'}}
            >
              <h3 className="text-lg font-semibold mb-4 text-center truncate">{showName}</h3>

              <div className="grid grid-cols-3 gap-x-4 gap-y-2 text-sm flex-grow">
                <p className='font-bold text-black'><strong>Nombre:</strong><br />{ticket.name}</p>
                <p className='font-bold text-black'><strong>Teléfono:</strong><br />{ticket.phone}</p>
                <p className='font-bold text-black'><strong>Fecha y Hora:</strong><br />{ticket.date}</p>
                <p className='font-bold text-black'><strong>División:</strong><br />{ticket.division}</p>
                <p className='font-bold text-black'><strong>Asiento:</strong><br />{ticket.seat || "No asignado"}</p>
                <p className='font-bold text-black'><strong>Fila:</strong><br />{ticket.row || "No asignada"}</p>
                <p className='font-bold text-black'><strong>Precio:</strong><br />${priceWithTax.toFixed(2)}</p>
                <p className='font-bold text-black'><strong>Dirección:</strong><br />{ticket.location}</p>
              </div>

              <div className="mt-4 flex justify-center">
                <img
                  src={ticket.qrCode}
                  alt="QR Code"
                  className="w-24 h-24 object-contain"
                />
              </div>
              <p className='font-bold text-black'><strong>Email:</strong><br />{ticket.mail || "No disponible"}</p>

              {user.cashier === true && (
                <div className="space-y-3 mt-4">
                  <label className="block text-sm font-medium">
                    Enviar a:
                    <select
                      value={sendTo}
                      onChange={handleSendToChange}
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:ring-blue-500 focus:border-blue-500"
                    >
                      <option value={ticket.mail || "Correo no disponible"}>
                        Mi correo ({ticket.mail || "Correo no disponible"})
                      </option>
                      <option value="custom">Otro correo</option>
                    </select>
                  </label>

                  {showCustomEmailInput && (
                    <input
                      type="email"
                      value={customEmail}
                      onChange={handleEmailChange}
                      placeholder="Ingresa el correo"
                      className="block w-full rounded-md border-gray-300 p-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                  )}

                  <button
                    onClick={() => sendTicketEmail(ticket)}
                    className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2 rounded-md transition"
                  >
                    Enviar Ticket por Email
                  </button>
                  <button
                    onClick={() => downloadPDF(ticket)}
                    className="w-full bg-gray-600 hover:bg-gray-700 text-white py-2 rounded-md transition"
                  >
                    Descargar PDF
                  </button>
                </div>
              )}
            </div>
          );
        })}
      </div>

      <div className="mt-8 flex justify-center items-center space-x-6">
        <button
          onClick={handlePrevPage}
          disabled={currentPage === 1}
          className="px-4 py-2 bg-gray-300 rounded disabled:opacity-50 hover:bg-gray-400"
        >
          Anterior
        </button>
        <span className="font-medium">
          Página {currentPage} de {totalPages}
        </span>
        <button
          onClick={handleNextPage}
          disabled={currentPage === totalPages}
          className="px-4 py-2 bg-gray-300 rounded disabled:opacity-50 hover:bg-gray-400"
        >
          Siguiente
        </button>
      </div>
    </div>
  );
};

export default SuccessPage;