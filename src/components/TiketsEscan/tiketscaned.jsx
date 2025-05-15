import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import axios from "axios";
import { getShows } from "../Redux/Actions/actions"; // Asegúrate de que el path sea correcto
import { updateTicketStatus } from "../Redux/Actions/actions"; // Asegúrate de que la acción existe
import "./ticketdetail.css";

const Ticketscan = () => {
  const { ticketId } = useParams();
  const dispatch = useDispatch();
  const user = useSelector((state) => state.user);  // Accede al usuario desde Redux
  const shows = useSelector((state) => state.shows); // Accedemos a los shows desde Redux
  const [ticket, setTicket] = useState(null);
  const [message, setMessage] = useState(""); // Mensaje general (verde o rojo)
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [loadingShows, setLoadingShows] = useState(true);
  const [errorShows, setErrorShows] = useState(null);
  const [isFirstScan, setIsFirstScan] = useState(true); // Para controlar si es el primer escaneo

  // Verificar si el usuario tiene permisos
  const isAuthorized = user?.isAdmin || user?.cashier;

  useEffect(() => {
    if (!isAuthorized) return;  // Si el usuario no está autorizado, no intentamos obtener el ticket.

    const fetchTicketDetails = async () => {
      try {
        const response = await axios.get(`/tickets/useQR/${ticketId}`);
        const ticketData = response.data.ticket || response.data;

        setTicket(ticketData);
        setMessage(response.data.message || "Ticket encontrado");
        setIsFirstScan(false); // Es el primer escaneo exitoso
      } catch (error) {
        // Aquí evitamos loggear el error en la consola
        setError(error.response?.data?.message || "No se pudo obtener la información del ticket.");
        setMessage(error.response?.data?.message || "Hubo un error al procesar el ticket.");
      } finally {
        setLoading(false);
      }
    };

    fetchTicketDetails();
  }, [ticketId, isAuthorized]);

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

  useEffect(() => {
    // Activamos la acción PUT después de que el ticket se haya cargado correctamente
    if (ticket) {
      dispatch(updateTicketStatus(ticketId));  // Llamamos a la acción PUT
    }
  }, [ticket, ticketId, dispatch]);  // Solo se ejecutará cuando 'ticket' cambie


  if (!isAuthorized) {
    return (
      <div style={{ display: "flex", justifyContent: "center", alignItems: "center", height: "100vh", color: "red", fontSize: "20px" }}>
        No está autorizado a leer el QR.
      </div>
    );
  }

  if (loading) return <div>Cargando detalles del ticket...</div>;

  // Si hubo error, mostramos solo el error y no intentamos renderizar los datos del ticket.
  if (error) {
    return (
      <div className="ticket-detail-container">
        <h1>Detalles del Ticket</h1>
        <p style={{ color: "red", fontWeight: "bold" }}>{message}</p>
      </div>
    );
  }

  if (!ticket) return <div>No se encontró el ticket.</div>;

  // Si no hubo errores, mostramos los datos del ticket normalmente.
  const showName = shows.find((show) => show.id === ticket.showId)?.name || "Show desconocido";
  const [eventDate, eventTime] = ticket.date.split(" || ");

  return (
    <div className="ticket-detail-container">
      <h1>Detalles del Ticket</h1>
      {/* Mostramos el mensaje en verde cuando es el primer escaneo */}
      {isFirstScan && message && <p style={{ color: "green", fontWeight: "bold" }}>{message}</p>}

      {/* Si se ha activado offQR, mostramos un mensaje en rojo */}
      {!isFirstScan && message && <p style={{ color: "red", fontWeight: "bold" }}>{message}</p>}

      <p><strong>Nombre:</strong> {ticket.name}</p>
      <p><strong>DNI:</strong> {ticket.dni}</p>
      <p><strong>Email:</strong> {ticket.mail}</p>
      <p><strong>Teléfono:</strong> {ticket.phone}</p>
      <p><strong>Fecha:</strong> {eventDate}</p>
      <p><strong>Hora:</strong> {eventTime}</p>
      <p><strong>División:</strong> {ticket.division}</p>
      <p><strong>Asiento:</strong> {ticket.seat || "N/A"}</p>
      <p><strong>Fila:</strong> {ticket.row || "N/A"}</p>
      <p><strong>Precio:</strong> ${ticket.price}</p>
      <p><strong>Evento:</strong> {loadingShows ? "Cargando..." : errorShows ? errorShows : showName}</p>
    </div>
  );
};

export default Ticketscan;
