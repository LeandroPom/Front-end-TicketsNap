import React, { useState, useEffect } from 'react';
import { useLocation, useParams, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { getShows } from '../Redux/Actions/actions';
import emailjs from 'emailjs-com'; // Importar emailjs
import axios from 'axios';

const TicketGeneral = () => {
  const { id } = useParams(); // Obtener id de la URL si existe
  const location = useLocation();
  const queryParams = new URLSearchParams(location.search);
  const zoneId = queryParams.get('zoneId');
  const showId = queryParams.get('showId');
  const user = useSelector((state) => state.user);  // Obtener el usuario desde el estado global de Redux
  const navigate = useNavigate();  // Para redirigir en caso de error
  const userId = user?.id;  // Obtener el id del usuario actual
  
  

  const [ticket, setTicket] = useState(null); // Estado para el ticket
  const [loading, setLoading] = useState(true); // Estado de carga
  const [showName, setShowName] = useState(''); // Nombre del show
  const [error, setError] = useState(null); // Estado de error
  const [sendTo, setSendTo] = useState(''); // Correo al que enviar el ticket
  const [customEmail, setCustomEmail] = useState(''); // Correo personalizado
  const [showCustomEmailInput, setShowCustomEmailInput] = useState(false); // Controlar el input de correo
  const dispatch = useDispatch();

  const shows = useSelector((state) => state.shows); // Estado de shows desde Redux

  // useEffect para cargar los shows si no están cargados
  useEffect(() => {
    if (shows.length === 0) {
      dispatch(getShows());
    }
  }, [shows, dispatch]);

  // useEffect para obtener el ticket
  useEffect(() => {
    const fetchTicket = async () => {
      if (id && user && user.id) {  // Verifica si user está disponible y tiene un id
        try {
          let ticketData = null;
  
          // Si hay un id en la URL, obtenemos el ticket desde el backend
          const response = await axios.get(`/tickets/${id}`);
          ticketData = response.data;
  
          // Verificar si el userId del ticket coincide con el userId actual
          if (ticketData.userId !== user.id) {
            setError('Acceso no autorizado');
            setLoading(false);
            navigate('/');  // Redirige al inicio si el usuario no tiene acceso
          } else {
            setTicket(ticketData);
            setLoading(false);
          }
  
          // Buscar el nombre del show desde Redux si ya está cargado
          const show = shows.find((show) => show.id === parseInt(showId));
          if (show) {
            setShowName(show.name); // Usamos el nombre del show desde Redux
          }
        } catch (err) {
          setError('Error al obtener los datos del ticket');
          setLoading(false);
          console.error(err);
        }
      } else {
        setLoading(false); // Si no hay id o el usuario no está disponible, se detiene la carga
      }
    };
  
    fetchTicket();
  }, [id, user, navigate, showId, shows]); // Asegúrate de que el efecto dependa también de user, id y showId

  if (loading) return <p>Cargando ticket...</p>;

  if (error) return <p>{error}</p>;

  if (!ticket) return <p>No se encontró un ticket válido.</p>;


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
      show: showName || "Show desconocido",
      qrCode: ticket.qrCode,
      Direccion: ticket.location,
    };

    emailjs.send(
      'service_72a1029', // Tu ID de servicio
      'template_dl2ctup', // ID de la plantilla
      templateParams,
      '5DeCesBmnqWIqrrla' // Tu clave de usuario de EmailJS
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


  // Obtener si es VIP o General desde el ticket
  const isVIP = ticket?.division?.trim().toLowerCase() === 'vip';
  const isGeneral = ticket?.division?.trim().toLowerCase() === 'general';

  return (
    <div style={styles.container}>
      <h2 style={styles.title}>Ticket para el show: {showName}</h2>

      <div style={styles.ticketDetails}>
        <p><strong>Fecha:</strong> {ticket.date}</p>
        <p><strong>Ubicación:</strong> {ticket.location}</p>
        <p><strong>Precio:</strong> ${ticket?.price}</p>
        <p><strong>Comprador:</strong> {ticket.name}</p>
        <p><strong>DNI:</strong> {ticket.dni}</p>
        <p><strong>Email:</strong> {ticket.mail}</p>
        <p><strong>Teléfono:</strong> {ticket.phone}</p>
        {isVIP && <p style={styles.vipTag}>¡Ticket VIP!</p>}
        {isGeneral && <p style={styles.generalTag}>¡Ticket General!</p>}
        {ticket.qrCode && <img src={ticket.qrCode} alt="QR Code" style={styles.qrCode} />}
      </div>

      {/* Selector de correo */}
      <div>
        <label>
          Enviar a:
          <select value={sendTo} onChange={handleSendToChange}>
            <option value={ticket.mail}>
              Mi correo ({ticket.mail})
            </option>
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

      <button onClick={sendTicketEmail}>Enviar Ticket por Email</button>
    </div>
  );
};

const styles = {
  container: {
    border: '1px solid #ccc',
    padding: '20px',
    borderRadius: '10px',
    maxWidth: '600px',
    margin: '0 auto',
    backgroundColor: '#f9f9f9',
    textAlign: 'left',
    boxShadow: '0 4px 8px rgba(0, 0, 0, 0.1)',
    marginTop: '80px',
  },
  title: {
    textAlign: 'center',
    fontSize: '24px',
    color: '#333',
    marginBottom: '20px',
  },
  ticketDetails: {
    padding: '10px',
    backgroundColor: '#fff',
    borderRadius: '8px',
    boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)',
    lineHeight: '1.8',
  },
  qrCode: {
    width: '150px',
    marginTop: '20px',
    display: 'block',
    marginLeft: 'auto',
    marginRight: 'auto',
  },
  vipTag: {
    color: '#d4af37',
    fontWeight: 'bold',
    fontSize: '18px',
  },
  generalTag: {
    color: '#6c757d',
    fontWeight: 'bold',
    fontSize: '18px',
  },
};

export default TicketGeneral;
