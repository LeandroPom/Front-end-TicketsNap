import React, { useState, useEffect } from 'react';
import { useLocation, useParams, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { getShows } from '../Redux/Actions/actions';
import emailjs from 'emailjs-com'; // Importar emailjs
import axios from 'axios';
import Swal from 'sweetalert2'; // Importa SweetAlert2

const TicketGeneral = () => {
  const { id } = useParams(); // Obtener id de la URL si existe
  
  const location = useLocation();
  const queryParams = new URLSearchParams(location.search);
  const zoneId = queryParams.get('zoneId');
  const showId = queryParams.get('showId');
  const user = useSelector((state) => state?.user);  // Obtener el usuario desde el estado global de Redux
  const navigate = useNavigate();  // Para redirigir en caso de error
  const userId = user?.id;  // Obtener el id del usuario actual
  const [hasShownAlert, setHasShownAlert] = useState(false);
  const [ticket, setTicket] = useState(null); // Estado para el ticket
  const [loading, setLoading] = useState(true); // Estado de carga
  const [showName, setShowName] = useState(''); // Nombre del show
  const [error, setError] = useState(null); // Estado de error
  const [sendTo, setSendTo] = useState(''); // Correo al que enviar el ticket
  const [customEmail, setCustomEmail] = useState(''); // Correo personalizado
  const [showCustomEmailInput, setShowCustomEmailInput] = useState(false); // Controlar el input de correo
  const dispatch = useDispatch();
  const [hasFetched, setHasFetched] = useState(false);
  const [isFetching, setIsFetching] = useState(false);  // Estado para marcar si la petición está en curso
  const shows = useSelector((state) => state.shows); // Estado de shows desde Redux
  const priceWithTax = ticket?.price * 1.2;
  

  
  // useEffect para cargar los shows si no están cargados
  useEffect(() => {
    if (shows.length === 0) {
      dispatch(getShows());
    }
  }, [shows, dispatch]);

  // Función para cargar los datos del ticket
  
  // Función para cargar el ticket desde la API
  const fetchTicket = async () => {
    if (!id || !user || !user.id) {
      setError('ID no disponible o usuario no válido');
      setLoading(false);
      return; // Si no hay id o usuario, no hacemos nada
    }

    try {
      setLoading(true); // Iniciamos la carga
      const response = await axios.get(`/tickets/${id}`);
      const ticketData = response.data;

      // Verificamos si el userId del ticket coincide con el userId actual
      if (ticketData.userId !== user.id) {
        setError('Acceso no autorizado');
        setLoading(false);
        navigate('/');  // Redirige al inicio si el usuario no tiene acceso
        return;
      }

      setTicket(ticketData);  // Actualizamos el estado con los datos del ticket
      setLoading(false);

      // Buscar el nombre del show desde Redux si ya está cargado
      const show = shows.find((show) => show.id === parseInt(showId));
      if (show) {
        console.log('Show encontrado:', show.name); // Puedes guardar o usar el nombre del show como quieras
      }
    } catch (err) {
      setError('Error al obtener los datos del ticket');
      setLoading(false);
      console.error(err);
    }
  };

  // Función para mostrar la alerta
  const showAlert = () => {
    if (!id) {
      console.log("No hay id en la URL, no se mostrará la alerta.");
      return; // Si no hay id, no mostrar la alerta ni ejecutar la acción
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

  // Llamamos a `showAlert` solo cuando el `id` y `user` están disponibles
  useEffect(() => {
    if (id && user) {
      showAlert();  // Llama a la alerta solo si el `id` y `user` están disponibles
    }
  }, [user]); // Dependencias: ejecuta cuando `id` o `user` cambian




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

  const downloadPDF = () => {
      const doc = new jsPDF();
  
      // Agregar contenido al PDF
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
  
      // Agregar código QR si lo tienes
      const qrImg = new Image();
      qrImg.src = ticket.qrCode;
      qrImg.onload = function() {
        doc.addImage(qrImg, 'JPEG', 10, 110, 80, 80);  // Ajusta las coordenadas y tamaño según sea necesario
  
        // Después de agregar la imagen, descargar el archivo PDF
        doc.save('ticket.pdf');
      };
    };


  // Obtener si es VIP o General desde el ticket
  const isVIP = ticket?.division?.trim().toLowerCase() === 'vip';
  const isGeneral = ticket?.division?.trim().toLowerCase() === 'general';

  return (
    <div style={styles.container}>
      <h2 style={styles.title}>Ticket para el show: {showName}</h2>

      <div style={styles.ticketDetails}>
        <p style={{color:"black"}}><strong>Fecha:</strong> {ticket.date}</p>
        <p style={{color:"black"}}><strong>Ubicación:</strong> {ticket.location}</p>
         <p style={{color:"black"}}><strong>Precio:</strong> ${priceWithTax.toFixed(2)}</p> {/* Precio con el 20% añadido */}
        <p style={{color:"black"}}><strong>Comprador:</strong> {ticket.name}</p>
        <p style={{color:"black"}}><strong>DNI:</strong> {ticket.dni}</p>
        <p style={{color:"black"}}><strong>Email:</strong> {ticket.mail}</p>
        <p style={{color:"black"}}><strong>Teléfono:</strong> {ticket.phone}</p>
        {isVIP && <p style={styles.vipTag}>¡Ticket VIP!</p>}
        {isGeneral && <p style={styles.generalTag}>¡Ticket General!</p>}
        {ticket.qrCode && <img src={ticket.qrCode} alt="QR Code" style={styles.qrCode} />}
      </div>

      <button onClick={sendTicketEmail} className="btn-primary">Enviar Ticket por Email</button>
      <button onClick={downloadPDF} className="btn-secondary">Descargar PDF</button>

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
        <p><strong>Precio:</strong> ${priceWithTax.toFixed(2)}</p> {/* Precio con el 20% añadido */}
        <p><strong>Evento:</strong> {showName}</p>
        <p><strong>Dirección:</strong> {ticket.location}</p>
        <div className="qr-container">
          <img src={ticket.qrCode} alt="QR Code" className="qr-image" />
        </div>
      </div>
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
