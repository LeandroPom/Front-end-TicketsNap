import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import axios from "axios";
import Swal from "sweetalert2";
import { getShows } from "../../Redux/Actions/actions"; // Importar la acción para traer los shows

const SoldTickets = () => {
  const dispatch = useDispatch();

  // Estados de los tickets y los shows
  const [tickets, setTickets] = useState([]);
  const [noCancelledTickets, setNoCancelledTickets] = useState([]);
  const [cancelledTickets, setCancelledTickets] = useState([]);
  const [divisionFilter, setDivisionFilter] = useState("");
  const [dateFilter, setDateFilter] = useState("");
  const [cashierFilter, setcashierFilter] = useState("");
  const [canceledFilter, setCanceledFilter] = useState(null);
  const [showFilter, setShowFilter] = useState(""); // Filtro para el nombre del show
  const [users, setUsers] = useState([]); // Para almacenar todos los usuarios que son cajeros

  const user = useSelector((state) => state?.user);

  // Traer los shows desde Redux
  const shows = useSelector((state) => state.shows);

  useEffect(() => {
    // Llamada a la API para obtener los tickets vendidos
    fetchTickets();
    dispatch(getShows()); // Traer los shows desde la acción
    fetchUsers(); // Llamada a la API para obtener los usuarios
  }, [dispatch]);

  useEffect(() => {
    filterTickets();
  }, [divisionFilter, canceledFilter, showFilter, tickets, dateFilter, cashierFilter]); // Incluir cashierFilter en las dependencias

  // Llamada a la API para obtener los tickets vendidos
  const fetchTickets = async () => {
    try {
      const response = await axios.get("/tickets");
      setTickets(response.data.tickets);
    } catch (error) {
      console.error("Error al cargar los tickets:", error);
      Swal.fire({
        icon: "error",
        title: "Error",
        text: "No se pudieron cargar los tickets vendidos.",
      });
    }
  };

  // Llamada a la API para obtener los usuarios (cajeros)
  const fetchUsers = async () => {
    try {
      const response = await axios.get("/users");
      const cashierUsers = response.data.data.filter((user) => user.cashier); // Filtrar solo los cajeros
      setUsers(cashierUsers); // Guardar los cajeros en el estado
    } catch (error) {
      console.error("Error al cargar los usuarios:", error);
      Swal.fire({
        icon: "error",
        title: "Error",
        text: "No se pudieron cargar los usuarios.",
      });
    }
  };

  const filterTickets = () => {
    let filtered = tickets;

    // Filtramos por división, estado de cancelación y nombre del show si se aplica
    if (divisionFilter) {
      filtered = filtered.filter(ticket => ticket.division === divisionFilter);
    }

    if (canceledFilter !== null) {
      filtered = filtered.filter(ticket => ticket.state === canceledFilter);
    }

    if (dateFilter) {
      filtered = filtered.filter(ticket => ticket.date === dateFilter);
    }
    if (cashierFilter) {
      // Filtrar tickets por el cajero que ha vendido el ticket (comparing ticket.userId with cashierFilter)
      filtered = filtered.filter(ticket => ticket.userId === users.find(user => user.name === cashierFilter)?.id);
    }

    if (showFilter) {
      filtered = filtered.filter(ticket => {
        const show = shows.find((show) => show.id === ticket.showId);
        return show && show.name.toLowerCase().includes(showFilter.toLowerCase());
      });
    }

    // Agrupar tickets por combinación de division, row y seat
    const groupedTickets = {};

    filtered.forEach(ticket => {
      const key = `${ticket.division}_${ticket.row}_${ticket.seat}`;

      // Si no existe un ticket con esa combinación, lo añadimos
      if (!groupedTickets[key]) {
        groupedTickets[key] = ticket;
      } else {
        // Si ya existe un ticket con esa combinación, comprobamos el estado
        // Solo si el ticket tiene state: true, se reemplaza
        if (ticket.state === true && groupedTickets[key].state === false) {
          groupedTickets[key] = ticket;
        }
      }
    });

    // Ahora, separo los tickets en no cancelados y cancelados
    const noCancelled = Object.values(groupedTickets).filter(ticket => ticket.state === true);
    const cancelled = Object.values(groupedTickets).filter(ticket => ticket.state === false);

    // Aseguramos que los tickets cancelados que tienen el mismo row y seat
    // no aparezcan en la lista de cancelados si ya existen tickets no cancelados.
    setNoCancelledTickets(noCancelled);
    setCancelledTickets(cancelled);
  };

  // Obtener las divisiones disponibles
  const divisions = [...new Set(tickets.map(ticket => ticket.division))];
  const date = [...new Set(tickets.map(ticket => ticket.date))];

  // Lógica de cancelación de tickets
  const cancelTicket = async (ticket) => {
    const result = await Swal.fire({
      title: '¿Estás seguro de cancelar este ticket?',
      text: `El ticket con ID ${ticket.id} será cancelado y el asiento será liberado.`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Sí, cancelar ticket',
      cancelButtonText: 'No, volver',
    });

    if (result.isConfirmed) {
      try {
        await axios.delete(`/tickets/cancel/${ticket.id}`);
        Swal.fire({
          icon: "success",
          title: "Ticket Cancelado",
          text: `El ticket con ID ${ticket.id} ha sido cancelado exitosamente.`,
        });
        fetchTickets();
      } catch (error) {
        console.error("Error al cancelar el ticket:", error);
        Swal.fire({
          icon: "error",
          title: "Error",
          text: "No se pudo cancelar el ticket. Por favor, inténtalo de nuevo.",
        });
      }
    }
  };

  return (
    <div style={{ padding: "20px" }}>
      <h2>Detalles de Tickets</h2>
      <h3>Nombre del Cajero: {user && user.name ? user.name : "Cargando..."}</h3>

      {/* Filtros */}
      <div style={{ marginBottom: "20px" }}>
        <label>Filtrar por División:</label>
        <select
          value={divisionFilter}
          onChange={(e) => setDivisionFilter(e.target.value)}
          style={{ marginLeft: "10px", padding: "5px" }}
        >
          <option value="">Todas las divisiones</option>
          {divisions.map((division, index) => (
            <option key={index} value={division}>
              {division}
            </option>
          ))}
        </select>
      </div>

      {/* Filtros */}
      <div style={{ marginBottom: "20px" }}>
        <label>Filtrar por Fecha y Hora:</label>
        <select
          value={dateFilter}
          onChange={(e) => setDateFilter(e.target.value)}
          style={{ marginLeft: "10px", padding: "5px" }}
        >
          <option value="">Todas las fechas y Horarios</option>
          {date.map((date, index) => (
            <option key={index} value={date}>
              {date}
            </option>
          ))}
        </select>
      </div>

      {/* Filtro de Cajero */}
      <div style={{ marginBottom: "20px" }}>
        <label>Filtrar por Cajero:</label>
        <select
          value={cashierFilter}
          onChange={(e) => setcashierFilter(e.target.value)}
          style={{ marginLeft: "10px", padding: "5px" }}
        >
          <option value="">Todos los cajeros</option>
          {users.length > 0 ? (
            users.map((user) => (
              <option key={user.id} value={user.name}>
                {user.name}
              </option>
            ))
          ) : (
            <option value="">No hay cajeros disponibles</option>
          )}
        </select>
      </div>

      {/* Filtro por Nombre de Show */}
      <div style={{ marginBottom: "20px" }}>
        <label>Filtrar por Show:</label>
        <input
          type="text"
          value={showFilter}
          onChange={(e) => setShowFilter(e.target.value)}
          placeholder="Buscar por nombre de show"
          style={{ marginLeft: "10px", padding: "5px" }}
        />
      </div>

      {/* Tabla de No Cancelados */}
      <div style={{ borderBottom: "2px solid #ccc", paddingBottom: "20px" }}>
        <h3>Tikets Disponibles</h3>
        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead>
            <tr>
              <th>Show</th>
              <th>División</th>
              <th>Fila</th>
              <th>Asiento</th>
              <th>Fecha y Horarios</th>
              <th>Precio</th>
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {noCancelledTickets.map((ticket) => (
              <tr key={ticket.id}>
                <td>{shows.find(show => show.id === ticket.showId)?.name}</td>
                <td>{ticket.division}</td>
                <td>{ticket.row}</td>
                <td>{ticket.seat}</td>
                <td>{ticket.date}</td>
                <td>${ticket.price}</td>
                <td>
                  <button onClick={() => cancelTicket(ticket)}>Cancelar</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Tabla de Cancelados */}
      <div>
        <h3>Tickets Cancelados</h3>
        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead>
            <tr>
              <th>Show</th>
              <th>División</th>
              <th>Fila</th>
              <th>Asiento</th>
              <th>Fecha y Horarios</th>
              <th>Precio</th>
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {cancelledTickets.map((ticket) => (
              <tr key={ticket.id}>
                <td>{shows.find(show => show.id === ticket.showId)?.name}</td>
                <td>{ticket.division}</td>
                <td>{ticket.row}</td>
                <td>{ticket.seat}</td>
                <td>{ticket.date}</td>
                <td>${ticket.price}</td>
                <th>Cancelado</th>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default SoldTickets;
