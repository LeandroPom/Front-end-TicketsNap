import React, { useEffect, useState } from 'react';
import { useParams, useLocation, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { getShows } from '../Redux/Actions/actions';
import emailjs from 'emailjs-com'; // Importar emailjs
import axios from 'axios';
import styles from './succesbuy.css';

const SuccessPage = () => {
  const { id } = useParams();  // Obtener el id de la URL (si existe)
  const location = useLocation();
  const [ticket, setTicket] = useState(location.state || null); // Usamos location.state si existe
  const [loading, setLoading] = useState(true); // Estado de carga
  const [error, setError] = useState(null);  // Estado de error
  const [sendTo, setSendTo] = useState(''); // Correo al que enviar el ticket
  const [customEmail, setCustomEmail] = useState(''); // Correo personalizado
  const [showCustomEmailInput, setShowCustomEmailInput] = useState(false); // Controlar el input
  const user = useSelector((state) => state.user);  // Obtener el usuario actual del estado global de Redux
  const navigate = useNavigate();

  const dispatch = useDispatch();
  const shows = useSelector((state) => state.shows);

  // Cargar los shows si no están disponibles
  useEffect(() => {
    if (shows.length === 0) {
      dispatch(getShows());
    }
  }, [dispatch, shows]);

  // Si hay un id en la URL, obtener el ticket desde el backend
  useEffect(() => {
    if (id && user && user.id) {  // Verifica si user está disponible y tiene un id
      axios.get(`/tickets/${id}`)
        .then((response) => {
          const ticketData = response.data;
          if (ticketData.userId !== user.id) {
            setError('Acceso no autorizado');
            setLoading(false);
            navigate('/');
          } else {
            setTicket(ticketData);
            setLoading(false);
          }
        })
        .catch((err) => {
          setError('Error al obtener los datos del ticket');
          setLoading(false);
        });
    } else {
      setLoading(false); // Si no hay id o el usuario no está disponible, se detiene la carga
    }
  }, [id, user, navigate]); // Asegúrate de que el efecto dependa también de user.

  const sendTicketEmail = () => {
    const templateParams = {
      to_email: sendTo === 'custom' ? customEmail : sendTo,  // Usamos customEmail si se elige "Otro correo"
      from_name: 'Tu Plataforma de Ventas',
      name: ticket.name,
      email: ticket.mail,
      phone: ticket.phone,
      date: ticket.date,
      division: ticket.division,
      seat: ticket.seat,
      row: ticket.row,
      price: ticket?.price,
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
    .then((response) => {
      alert('Correo enviado correctamente!');
    })
    .catch((error) => {
      console.error('Error al enviar el correo:', error);
      alert('Hubo un problema al enviar el correo.');
    });
  };

  const handleEmailChange = (event) => {
    setCustomEmail(event.target.value);
  };

  const handleSendToChange = (event) => {
    setSendTo(event.target.value);
    setShowCustomEmailInput(event.target.value === 'custom'); // Mostrar input si se elige 'custom'
  };

  const printTicket = () => {
    const printContent = document.getElementById('ticket-info').innerHTML;
    const newWindow = window.open('', '', 'width=600,height=600');
    newWindow.document.write('<html><head><title>Imprimir Ticket</title></head><body>');
    newWindow.document.write(printContent);
    newWindow.document.write('</body></html>');
    newWindow.document.close();
    newWindow.print();
  };

  if (loading) {
    return <div className="loading">Cargando datos...</div>;
  }

  if (error) {
    return <div className="error">{error}</div>;
  }

  if (!ticket || !ticket.mail) {
    return <p>Datos del ticket no disponibles.</p>;
  }

  const showName = shows.find(show => show.id === ticket.showId)?.name || "Show desconocido";

  return (
    <div className="ticket-container">
      <h1 className="ticket-title">Compra Exitosa</h1>
      <p><strong>Nombre:</strong> {ticket.name}</p>
      <p><strong>Email:</strong> {ticket.mail || "Correo no disponible"}</p>
      <p><strong>Teléfono:</strong> {ticket.phone}</p>
      <p><strong>Fecha y Hora:</strong> {ticket.date}</p>
      <p><strong>División:</strong> {ticket.division}</p>
      {ticket.seat && <p><strong>Asiento:</strong> {ticket.seat}</p>}
      {ticket.row && <p><strong>Fila:</strong> {ticket.row}</p>}
      <p><strong>Precio:</strong> ${ticket.totalPrice || ticket.price}</p>
      <p><strong>Evento:</strong> {showName}</p>
      <p><strong>Dirección:</strong> {ticket.location}</p>
  
      <div className="qr-container">
        <img src={ticket.qrCode} alt="QR Code" className="qr-image" />
      </div>
  
      {/* Selector de correo */}
      <div className="email-select-container">
        <label>
          Enviar a:
          <select value={sendTo} onChange={handleSendToChange} className="email-select">
            <option value={ticket.mail || "Correo no disponible"}>
              Mi correo ({ticket.mail || "Correo no disponible"})
            </option>
            <option value="custom">Otro correo</option>
          </select>
        </label>
  
        {/* Input para ingresar el correo si se elige 'Otro correo' */}
        {showCustomEmailInput && (
          <div className="custom-email-container">
            <input 
              type="email" 
              value={customEmail} 
              onChange={handleEmailChange} 
              placeholder="Ingresa el correo"
              className="email-input"
            />
          </div>
        )}
      </div>
  
      <button onClick={sendTicketEmail} className="btn-primary">Enviar Ticket por Email</button>
      <button onClick={printTicket} className="btn-secondary">Imprimir Ticket</button>
  
      {/* Contenido a imprimir */}
      <div id="ticket-info" className="print-ticket">
        <h2>Detalles del Ticket</h2>
        <p><strong>Nombre:</strong> {ticket.name}</p>
        <p><strong>Email:</strong> {ticket.mail || "Correo no disponible"}</p>
        <p><strong>Teléfono:</strong> {ticket.phone}</p>
        <p><strong>Fecha y Hora:</strong> {ticket.date}</p>
        <p><strong>División:</strong> {ticket.division}</p>
        <p><strong>Asiento:</strong> {ticket.seat}</p>
        <p><strong>Fila:</strong> {ticket.row}</p>
        <p><strong>Precio:</strong> ${ticket.price}</p>
        <p><strong>Evento:</strong> {showName}</p>
        <p><strong>Dirección:</strong> {shows.location}</p>
        <div className="qr-container">
          <img src={ticket.qrCode} alt="QR Code" className="qr-image" />
        </div>
      </div>
    </div>
  );  
};

export default SuccessPage;
