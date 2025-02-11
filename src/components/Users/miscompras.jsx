import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { getShows } from '../Redux/Actions/actions'; 
import '../Users/miscompras.css';

const MisCompras = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const user = useSelector((state) => state?.user);
  const shows = useSelector((state) => state.shows);

  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const ticketsPerPage = 2; // MOSTRAR 2 TICKETS POR PÁGINA

  useEffect(() => {
    const fetchTickets = async () => {
      try {
        const response = await axios.get('/tickets');
        if (response.data?.tickets) {
          const userTickets = response.data.tickets.filter(ticket => ticket.userId === user?.id);
          setTickets(userTickets);
        }
      } catch (err) {
        setError('Error al obtener los tickets. Intente nuevamente.');
      } finally {
        setLoading(false);
      }
    };

    if (user) {
      fetchTickets();
      dispatch(getShows());
    }
  }, [user, dispatch]);

  const currentDateTime = new Date();

  if (loading) return <div className="loading">Cargando tus compras...</div>;
  if (error) return <div className="error">{error}</div>;
  if (tickets.length === 0) return <div className="no-compras">No tienes compras registradas.</div>;

  // PAGINACIÓN: Obtener los tickets de la página actual
  const startIndex = (currentPage - 1) * ticketsPerPage;
  const endIndex = startIndex + ticketsPerPage;
  const currentTickets = tickets.slice(startIndex, endIndex);

  return (
    <div className="mis-compras-container">
      <h2>Mis Compras</h2>
      <ul className="ticket-list">
        {currentTickets.map(ticket => {
          const showName = shows.find(show => show.id === ticket.showId)?.name || "Show desconocido";

          const dateTimeParts = ticket.date.split(" || ");
          const eventDateStr = dateTimeParts[0]; 
          const eventTimeStr = dateTimeParts[1]?.split(" - ")[1]; 

          const eventDateTime = new Date(`${eventDateStr}T${eventTimeStr}:00`);
          const isPastEvent = eventDateTime < currentDateTime;

          return (
            <li key={ticket.id} className="ticket-item">
              <p><strong>Usuario:</strong> {ticket.name}</p>
              <p><strong>Evento:</strong> {showName}</p>
              <p><strong>Zona:</strong> {ticket.division}</p>
              <p><strong>Fecha y Hora:</strong> {ticket.date}</p>
              <p><strong>Fila:</strong> {ticket.row}</p>
              <p><strong>Asiento:</strong> {ticket.seat}</p>
              <p><strong>Precio:</strong> ${ticket.price}</p>

              {/* Estado del evento */}
              <p className={`event-status ${isPastEvent ? "event-finalizado" : "event-activo"}`}>
                {isPastEvent ? "Evento Finalizado" : "Evento Activo"}
              </p>

              {ticket.qrCode && <img src={ticket.qrCode} alt="Código QR" className="qr-code" />}
            </li>
          );
        })}
      </ul>

      {/* BOTONES DE PAGINACIÓN */}
      <div className="pagination">
        <button 
          className="page-button" 
          disabled={currentPage === 1} 
          onClick={() => setCurrentPage(prev => prev - 1)}
        >
          Anterior
        </button>

        <span className="page-info">Página {currentPage} de {Math.ceil(tickets.length / ticketsPerPage)}</span>

        <button 
          className="page-button" 
          disabled={endIndex >= tickets.length} 
          onClick={() => setCurrentPage(prev => prev + 1)}
        >
          Siguiente
        </button>
      </div>

      <button className="back-button" onClick={() => navigate('/profile')}>Back Profile</button>
    </div>
  );
};

export default MisCompras;
