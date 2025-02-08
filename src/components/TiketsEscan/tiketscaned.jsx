import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import axios from "axios";
import { getShows } from "../Redux/Actions/actions"; // Asegúrate de que el path sea correcto

const Ticketscan = () => {
  const { ticketId } = useParams();
  const dispatch = useDispatch();
  const shows = useSelector((state) => state.shows); // Accedemos a los shows desde Redux
  const [ticket, setTicket] = useState(null);
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [loadingShows, setLoadingShows] = useState(true);
  const [errorShows, setErrorShows] = useState(null);

  useEffect(() => {
    const fetchTicketDetails = async () => {
      try {
        
        const response = await axios.get(
          `/tickets/useQR/${ticketId}`
        );
        const ticketData = response.data.updatedTicket || response.data;
        setTicket(ticketData);
        setMessage(response.data.message || "Ticket encontrado");
       
      } catch (error) {
        console.error("❌ Error al obtener el ticket:", error.message);
        setError("No se pudo obtener la información del ticket.");
      } finally {
        setLoading(false);
      }
    };

    fetchTicketDetails();
  }, [ticketId]);

  useEffect(() => {
    if (shows.length === 0) {
      dispatch(getShows())
        .then(() => setLoadingShows(false))
        .catch(() => {
          setErrorShows("Error al obtener los shows");
          setLoadingShows(false);
        });
    } else {
      setLoadingShows(false);
    }
  }, [dispatch, shows]);

  if (loading) return <div>Cargando detalles del ticket...</div>;
  if (error) return <div style={{ color: "red" }}>{error}</div>;
  if (!ticket) return <div>No se encontró el ticket.</div>;

  const showName = shows.find((show) => show.id === ticket.showId)?.name || "Show desconocido";

  return (
    <div className="ticket-detail-container">
      <h1>Detalles del Ticket</h1>
      {message && <p style={{ color: "green", fontWeight: "bold" }}>{message}</p>}
      <p><strong>Nombre:</strong> {ticket.name}</p>
      <p><strong>Email:</strong> {ticket.mail}</p>
      <p><strong>Teléfono:</strong> {ticket.phone}</p>
      <p><strong>Fecha y Hora:</strong> {ticket.date}</p>
      <p><strong>División:</strong> {ticket.division}</p>
      <p><strong>Asiento:</strong> {ticket.seat || "N/A"}</p>
      <p><strong>Fila:</strong> {ticket.row || "N/A"}</p>
      <p><strong>Precio:</strong> ${ticket.price}</p>
      <p><strong>Evento:</strong> {loadingShows ? "Cargando..." : errorShows ? errorShows : showName}</p>
    </div>
  );
};

export default Ticketscan;