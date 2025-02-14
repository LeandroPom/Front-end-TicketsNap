import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { getShows } from '../Redux/Actions/actions';
import axios from 'axios';

const TicketGeneral = () => {
  const location = useLocation();
  const queryParams = new URLSearchParams(location.search);
  const zoneId = queryParams.get('zoneId');
  const showId = queryParams.get('showId');
  const user = useSelector((state) => state.user);
  const userId = user?.id;
  const ticketInfo = JSON.parse(queryParams.get('ticketInfo'));
  const [ticket, setTicket] = useState(ticketInfo || {}); // Usar ticketInfo si está disponible

  const shows = useSelector((state) => state.shows); // Estado de shows desde Redux
 
  const [loading, setLoading] = useState(true);
  const [showName, setShowName] = useState(''); // Estado para el nombre del show

  const dispatch = useDispatch();

  // useEffect para traer los shows desde Redux si no están cargados
  useEffect(() => {
    if (shows.length === 0) {
      dispatch(getShows()); // Asegurarse de que los shows estén cargados desde Redux
    }
  }, [shows, dispatch]);

  // useEffect para obtener el ticket y buscar el nombre del show
  useEffect(() => {
    const fetchTicketAndShow = async () => {
      try {
        // Llamada a la API para obtener detalles del ticket
        const response = await axios.get('/tickets');
        const tickets = response.data.tickets;

        // Encontrar el ticket correspondiente
        const userTicket = tickets.find(
          (t) => t.userId === userId && t.zoneId === parseInt(zoneId) && t.showId === parseInt(showId)
        );
        if (userTicket) {
          setTicket(userTicket);
        } else {
          setTicket(null);
        }

        // Buscar el nombre del show desde Redux si ya está cargado
        const show = shows.find((show) => show.id === parseInt(showId));
        if (show) {
          setShowName(show.name); // Si está en Redux, usa el nombre desde ahí
        }
      } catch (error) {
        console.error('Error al obtener el ticket o el show:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchTicketAndShow();
  }, [userId, zoneId, showId, shows]);

  if (loading) return <p>Cargando ticket...</p>;

  if (!ticket) return <p>No se encontró un ticket válido.</p>;

 // Obtener si es VIP o General desde la URL
 const isVIP = ticketInfo.division?.trim().toLowerCase() === 'vip';
 const isGeneral = ticketInfo.division?.trim().toLowerCase() === 'general';

  console.log("Ubicación:", ticket.location);
  console.log("Es VIP?", isVIP);
  console.log("Es General?", isGeneral);

  return (
    <div style={styles.container}>
      <h2 style={styles.title}>Ticket para el show: {showName}</h2>
      
      <div style={styles.ticketDetails}>
        <p><strong>Fecha:</strong> {ticket.date}</p>
        <p><strong>Ubicación:</strong> {ticket.location}</p>
        <p><strong>Precio:</strong> ${ticketInfo.price}</p>
        <p><strong>Comprador:</strong> {ticket.name}</p>
        <p><strong>DNI:</strong> {ticket.dni}</p>
        <p><strong>Email:</strong> {ticket.mail}</p>
        <p><strong>Teléfono:</strong> {ticket.phone}</p>
        {isVIP && <p style={styles.vipTag}>¡Ticket VIP!</p>}
        {isGeneral && <p style={styles.generalTag}>¡Ticket General!</p>}
        {ticket.qrCode && <img src={ticket.qrCode} alt="QR Code" style={styles.qrCode} />}
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
    marginTop: '80px', // Ajusta este valor si la navbar es más alta
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
