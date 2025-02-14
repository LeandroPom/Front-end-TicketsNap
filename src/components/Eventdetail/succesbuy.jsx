import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useLocation } from 'react-router-dom';
import { getShows } from '../Redux/Actions/actions';
import emailjs from 'emailjs-com'; // Importar emailjs

const SuccessPage = () => {
  const location = useLocation();
  const ticket = location.state;

  // Extraemos el correo de la URL si está disponible en `external_reference`
  const [emailFromUrl, setEmailFromUrl] = useState('No disponible');

  useEffect(() => {
    // Si la URL tiene parámetros, extraemos el correo
    const urlParams = new URLSearchParams(location.search);
    const externalReference = urlParams.get('external_reference');
    if (externalReference) {
      const email = externalReference.match(/mail:([^,]+)/)?.[1]; // Extraemos el correo
      if (email) {
        setEmailFromUrl(email); // Establecemos el correo extraído
      }
    }
  }, [location]);

  const dispatch = useDispatch();
  const shows = useSelector((state) => state.shows);
  const [loadingShows, setLoadingShows] = useState(true);
  const [errorShows, setErrorShows] = useState(null);
  const [sendTo, setSendTo] = useState(emailFromUrl || ticket.mail); // Usamos email extraído si está disponible
  const [customEmail, setCustomEmail] = useState(''); // Estado para el correo personalizado
  const [showCustomEmailInput, setShowCustomEmailInput] = useState(false); // Controlar si mostrar el input

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

  const sendTicketEmail = () => {
    // Usamos sendTo en lugar de ticket.mail para que pueda enviar al correo seleccionado
    const templateParams = {
      to_email: sendTo === 'custom' ? customEmail : sendTo,  // Si 'custom' es seleccionado, usamos customEmail
      from_name: 'Tu Plataforma de Ventas',  // Nombre del remitente (esto puede ser fijo o dinámico)
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
      'service_ge28yza',  // Tu service ID
      'template_dl2ctup', // Tu template ID
      templateParams,
      '5DeCesBmnqWIqrrla'  // Tu user ID
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

  if (!ticket || !ticket.mail) {
    return <p>Datos del ticket no disponibles.</p>;
  }

  const showName = shows.find(show => show.id === ticket.showId)?.name || "Show desconocido";

  if (loadingShows) {
    return <div className="loading">Cargando shows...</div>;
  }

  if (errorShows) {
    return <div className="error">{errorShows}</div>;
  }

  return (
    <div>
      <h1>Compra Exitosa</h1>
      <p><strong>Nombre:</strong> {ticket.name}</p>
      <p><strong>Email:</strong> {ticket.mail || "Correo no disponible"}</p>
      {/* <p><strong>Email:</strong> {sendTo || "Correo no disponible"}</p> */}
      <p><strong>Teléfono:</strong> {ticket.phone}</p>
      <p><strong>Fecha y Hora:</strong> {ticket.date}</p>
      <p><strong>División:</strong> {ticket.division}</p>
      {ticket.seat && <p><strong>Asiento:</strong> {ticket.seat}</p>}
      {ticket.row && <p><strong>Fila:</strong> {ticket.row}</p>}
      <p><strong>Precio:</strong> ${ticket.totalPrice || ticket.price}</p>
      <p><strong>Evento:</strong> {showName}</p>
      <p><strong>Direccion:</strong> {ticket.location}</p>

      <div>
        <img src={ticket.qrCode} alt="QR Code" />
      </div>

      {/* Selector de correo */}
      <div>
        <label>
          Enviar a:
          <select value={sendTo} onChange={handleSendToChange}>
            <option value={ticket.mail || "Correo no disponible"}>Mi correo ({ticket.mail || "Correo no disponible"})</option>
            <option value="custom">Otro correo</option>
          </select>
        </label>

        {/* Input para ingresar el correo si se elige 'Otro correo' */}
        {showCustomEmailInput && (
          <div>
            <input 
              type="email" 
              value={customEmail} 
              onChange={handleEmailChange} 
              placeholder="Ingresa el correo"
            />
          </div>
        )}
      </div>

      <button onClick={sendTicketEmail}>Enviar Ticket por Email</button> {/* Botón para enviar el email */}
      
      {/* Botón para imprimir los datos del ticket */}
      <button onClick={printTicket}>Imprimir Ticket</button>
      
      {/* Contenido a imprimir */}
      <div id="ticket-info" style={{display: 'none'}}>
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
        <p><strong>Direccion:</strong> {shows.location}</p>
        <div>
          <img src={ticket.qrCode} alt="QR Code" />
        </div>
      </div>
    </div>
  );
};

export default SuccessPage;
