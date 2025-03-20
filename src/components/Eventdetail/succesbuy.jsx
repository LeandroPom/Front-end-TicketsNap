import React, { useEffect, useState } from 'react';
import { useParams, useLocation, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { getShows } from '../Redux/Actions/actions';
import emailjs from 'emailjs-com'; // Importar emailjs
import axios from 'axios';
import styles from './succesbuy.css';
import Swal from 'sweetalert2'; // Importa SweetAlert2

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
    // Función para mostrar la alerta
    const showAlert = () => {
      if (!id || !user || !user.id) {
        setError('ID no disponible o usuario no válido');
        setLoading(false);  // Detenemos la carga si no hay id o usuario
        return; // Si no hay id o usuario, no mostrar la alerta ni ejecutar la acción
      }
  
      Swal.fire({
        title: '¡Felicidades por tu compra!',
        text: 'Estamos procesando tu ticket. Gracias por elegirnos.',
        icon: 'success',
        confirmButtonText: 'OK'
      }).then(() => {
       
        fetchTicket();  // Llamamos a `fetchTicket` solo después de hacer clic en OK
      });
    };
  
    // Función para obtener los datos del ticket
    const fetchTicket = async () => {
      if (!id || !user || !user.id) {
        setError('ID no disponible o usuario no válido');
        setLoading(false);  // Detenemos la carga si no hay id o usuario
        return;
      }
  
      try {
        setLoading(true); // Iniciamos la carga
      
        const response = await axios.get(`/tickets/${id}`);
        const ticketData = response.data;
    
  
        // Verificamos si el userId del ticket coincide con el userId actual
        if (ticketData.userId !== user.id) {
          setError('Acceso no autorizado');
      
          navigate('/');  // Redirige al inicio si el usuario no tiene acceso
          return;
        }
  
        setTicket(ticketData);  // Actualizamos el estado con los datos del ticket
      
      } catch (err) {
        setError('Error al obtener los datos del ticket');
        console.error(err);
      } finally {
        setLoading(false);  // Aseguramos que loading siempre se ponga en false
      
      }
    };
  
    // Llamamos a `showAlert` solo si el `id` y `user` están disponibles
    if (id && user) {
      showAlert();  // Llama a la alerta solo si el `id` y `user` están disponibles
    } else {
      setLoading(false); // Si no hay id o usuario, aseguramos que `loading` se detiene
    }
  
  }, [id, user, navigate]);  // Dependencias: ejecuta cuando `id`, `user` o `navigate` cambian

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
