import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { getShows } from '../Redux/Actions/actions'; 
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
              // Solo se filtran los tickets con precio igual a 0 para cajeros
              userTickets = response.data.tickets.filter(ticket => ticket.price === 0);
            }
          }
        } else {
          // Si el usuario es común (no admin ni cajero), mostramos los tickets normales
          const response = await axios.get('/tickets');
          if (response.data?.tickets) {
            // Filtramos por userId (tickets del usuario) y state === true (tickets activos)
            userTickets = response.data.tickets.filter(ticket => ticket.userId === user?.id && ticket.state === true);
            
            // Solo mostramos tickets con precio mayor a 0 para usuarios comunes
            userTickets = userTickets.filter(ticket => ticket.price > 0);
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
  <div className="mt-[160px] min-h-screen p-4 bg-gradient-to-b from-[rgba(27, 27, 235, 0.78)] to-[rgba(33, 33, 221, 0.4)] backdrop-blur-md">
    <div className="max-w-6xl mx-auto text-white">
      <h2 className="text-2xl md:text-3xl font-bold text-center mb-6">Mis Compras</h2>

      {/* Contenedor de tickets centrado */}
      <div className="flex justify-center">
        <ul className="grid gap-6 sm:grid-cols-2">
          {currentTickets.map(ticket => {
            const showName = shows.find(show => show.id === ticket.showId)?.name || "Show desconocido";
            const dateTimeParts = ticket.date.split(" || ");
            const eventDateStr = dateTimeParts[0]; 
            const eventTimeStr = dateTimeParts[1]?.split(" - ")[1]; 
            const eventDateTime = new Date(`${eventDateStr}T${eventTimeStr}:00`);
            const isPastEvent = eventDateTime < currentDateTime;

            return (
              <li key={ticket.id} className="bg-[rgba(86,86,190,0.4)] backdrop-blur-md rounded-lg p-4 shadow-md flex flex-col gap-1 max-w-sm">
                <p><strong>Usuario:</strong> {ticket.name}</p>
                <p><strong>Evento:</strong> {showName}</p>
                <p><strong>Zona:</strong> {ticket.division}</p>
                <p><strong>Fecha y Hora:</strong> {ticket.date}</p>

                {ticket.row && ticket.seat ? (
                  <>
                    <p><strong>Fila:</strong> {ticket.row}</p>
                    <p><strong>Asiento:</strong> {ticket.seat}</p>
                  </>
                ) : (
                  <>
                    <p><strong>Fila:</strong> No corresponde</p>
                    <p><strong>Asiento:</strong> No corresponde</p>
                  </>
                )}

                <p><strong>Precio:</strong> ${ticket.price}</p>

                <p className={`font-bold ${isPastEvent ? "text-red-400" : "text-green-400"}`}>
                  {isPastEvent ? "Evento Finalizado" : "Evento Activo"}
                </p>

                {ticket.price === 0 && <p className="italic text-yellow-300">Ticket Regalado</p>}

                {ticket.qrCode && (
                  <img 
                    src={ticket.qrCode} 
                    alt="Código QR" 
                    className="qr-code w-32 h-32 object-contain mt-2"
                  />
                )}
              </li>
            );
          })}
        </ul>
      </div>

      {/* PAGINACIÓN */}
      <div className="flex items-center justify-center gap-4 mt-8 flex-wrap">
        <button 
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded transition-colors disabled:opacity-50"
          disabled={currentPage === 1}
          onClick={() => setCurrentPage(prev => prev - 1)}
        >
          Anterior
        </button>

        <span className="text-sm md:text-base">Página {currentPage} de {Math.ceil(tickets.length / ticketsPerPage)}</span>

        <button 
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded transition-colors disabled:opacity-50"
          disabled={endIndex >= tickets.length}
          onClick={() => setCurrentPage(prev => prev + 1)}
        >
          Siguiente
        </button>
      </div>

      {/* BOTÓN REGRESAR */}
      <div className="flex justify-center mt-6">
        <button 
          onClick={() => navigate('/profile')} 
          className="bg-gray-500 hover:bg-gray-600 text-white px-4 py-2 rounded transition-colors"
        >
          Regresar
        </button>
      </div>
    </div>
  </div>
);

};

export default MisCompras;
