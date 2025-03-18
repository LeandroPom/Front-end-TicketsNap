import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { getShows } from '../Redux/Actions/actions'; 
import '../Users/miscompras.css';
import Swal from 'sweetalert2';  // Asegúrate de importar SweetAlert

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
        let userTickets = [];

        if (user?.isAdmin || user?.cashier) {
          // Si el usuario es admin o cajero, filtramos por precio === 0
          if (user?.cashier) {
            const response = await axios.get('/tickets');
            if (response.data?.tickets) {
              userTickets = response.data.tickets.filter(ticket => ticket.price === 0);  // Filtramos por precio === 0
            }
          }
        } else {
          // Si el usuario no es admin ni cajero, mostramos los tickets normales
          const response = await axios.get('/tickets');
          if (response.data?.tickets) {
            userTickets = response.data.tickets.filter(ticket => ticket.userId === user?.id && ticket.state === true); // Filtramos por state === true
          }
        }

        setTickets(userTickets);

        // Si no hay tickets, muestra SweetAlert
        if (userTickets.length === 0) {
          Swal.fire({
            title: '¡No tienes compras!',
            text: 'No tienes tickets registrados. ¿Quieres ir a tu perfil?',
            icon: 'info',
            confirmButtonText: 'Aceptar',
            customClass: {
              popup: 'custom-popup-success',  // Clase personalizada para el popup de éxito
            }
          }).then((result) => {
            if (result.isConfirmed) {
              navigate('/profile');  // Redirige a la página de perfil al aceptar
            }
          });
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
  }, [user, dispatch, navigate]);

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
      <h2 className='miscompras-title'>Mis Compras</h2>
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

              {/* Mostrar Fila y Asiento solo si existen */}
              {ticket.row && ticket.seat ? (
                <>
                  <p><strong>Fila:</strong> {ticket.row}</p>
                  <p><strong>Asiento:</strong> {ticket.seat}</p>
                </>
              ) : (
                <p>
                  <p><strong>Fila:</strong> No corresponde </p>
                  <p><strong>Asiento:</strong> No corresponde </p>
                </p>
              )}

              <p><strong>Precio:</strong> ${ticket.price}</p>

              {/* Estado del evento */}
              <p className={`event-status ${isPastEvent ? "event-finalizado" : "event-activo"}`}>
                {isPastEvent ? "Evento Finalizado" : "Evento Activo"}
              </p>

              {/* Si el precio es 0, mostramos "Ticket Regalado" */}
              {ticket.price === 0 && <p className="ticket-regalado">Ticket Regalado</p>}

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

      <button className="back-button" onClick={() => navigate('/profile')}>Regresar</button>
    </div>
  );
};

export default MisCompras;
