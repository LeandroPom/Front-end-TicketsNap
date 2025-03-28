import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import axios from "axios";
import Swal from "sweetalert2";
import { getShows } from "../../Redux/Actions/actions"; // Importar la acción para traer los shows
import * as XLSX from "xlsx";
import "./soldtickets.css"; // Importa el archivo CSS

const SoldTickets = () => {
  const dispatch = useDispatch();

  // Estados de los tickets y los shows
  const [tickets, setTickets] = useState([]);
  const [noCancelledTickets, setNoCancelledTickets] = useState([]);
  const [cancelledTickets, setCancelledTickets] = useState([]);
  const [divisionFilter, setDivisionFilter] = useState("");
  const [dateFilter, setDateFilter] = useState("");
  const [cashierFilter, setCashierFilter] = useState("");
  const [canceledFilter, setCanceledFilter] = useState(null); // Filtro para tickets cancelados
  const [showFilter, setShowFilter] = useState(""); // Filtro para el nombre del show
  const [users, setUsers] = useState([]); // Para almacenar todos los usuarios que son cajeros
  const [giftedFilter, setGiftedFilter] = useState(null); // Filtro para tickets regalados

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
  // Llamada a la API para obtener los usuarios
const fetchUsers = async () => {
  try {
    const response = await axios.get("/users");
    const allUsers = response.data || []; // Obtener todos los usuarios

    // Filtrar solo los cajeros (los que tienen 'cashier' en true)
    const cashierUsers = allUsers.filter(user => user.cashier);
    // Filtrar solo los usuarios comunes (los que no son 'cashier' ni 'isAdmin')
    const commonUsers = allUsers.filter(user => !user.cashier && !user.isAdmin);

    // Combinar los usuarios comunes y cajeros
    setUsers([...cashierUsers, ...commonUsers]);
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

        // Filtro por Tickets Regalados (price === 0)
if (giftedFilter !== null) {
  const filterGifted = giftedFilter === "true";
  filtered = filtered.filter(ticket => 
    (giftedFilter === "true" && ticket.price === 0) || 
    (giftedFilter === "false" && ticket.price !== 0)
  );
}

    // Filtramos por división, estado de cancelación y nombre del show si se aplica
    if (divisionFilter) {
      filtered = filtered.filter(ticket => ticket.division === divisionFilter);
    }

   


    if (canceledFilter !== null) {
      // Convertir canceledFilter a un valor booleano para la comparación
      const filterState = canceledFilter === "true";
      filtered = filtered.filter(ticket => ticket.state === filterState);
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

  const [currentPage, setCurrentPage] = useState(1);
  const ticketsPerPage = 5;
  const totalPages = Math.ceil(noCancelledTickets.length / ticketsPerPage);
  const currentTickets = noCancelledTickets.slice(
    (currentPage - 1) * ticketsPerPage, 
    currentPage * ticketsPerPage
  );

// Lógica para definir el rango de páginas visibles
const maxVisiblePages = 3;
let startPage = Math.max(1, currentPage - Math.floor(maxVisiblePages / 2));
let endPage = Math.min(totalPages, startPage + maxVisiblePages - 1);

if (endPage - startPage + 1 < maxVisiblePages) {
  startPage = Math.max(1, endPage - maxVisiblePages + 1);
}

const handlePageChange = (pageNumber) => {
  if (pageNumber >= 1 && pageNumber <= totalPages) {
    setCurrentPage(pageNumber);
  }


}
const handleDownloadExcel = () => {
  // Prepara los datos que quieres exportar
  const data = noCancelledTickets.map((ticket) => ({
    Show: shows.find(show => show.id === ticket.showId)?.name || "Cargando...",
    Division: ticket.division,
    Row: ticket.row,
    Seat: ticket.seat,
    Price: ticket.price,
    Cashier: users.find(user => user.id === ticket.userId)?.name || "Cajero Desconocido",
    Date: ticket.date.split(" || ")[0] || "Fecha no disponible",
    Time: ticket.date.split(" || ")[1] || "Hora no disponible",
  }));

  // Crea la hoja de Excel
  const worksheet = XLSX.utils.json_to_sheet(data);

  // Crea el libro de trabajo y agrega la hoja de datos
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, "Tickets No Cancelados");

  // Descarga el archivo Excel
  XLSX.writeFile(workbook, "tickets_no_cancelados.xlsx");
};


// Nueva función para regalar el ticket
const giftTicket = async (ticket) => {
  const result = await Swal.fire({
    title: '¿Estás seguro de regalar este ticket?',
    text: `El ticket con ID ${ticket.id} será marcado como "regalado".`,
    icon: 'warning',
    showCancelButton: true,
    confirmButtonText: 'Sí, regalar ticket',
    cancelButtonText: 'No, volver',
  });

  if (result.isConfirmed) {
    // No es necesario usar params aquí, solo poner el ID directamente en la URL
    console.log("Datos a enviar al backend para regalar el ticket:", ticket.id);

    try {
      // Ahora pasamos el ticket ID directamente en la URL
      const response = await axios.get(`/tickets/gift/${ticket.id}`);

      Swal.fire({
        icon: "success",
        title: "Ticket Regalado",
        text: `El ticket con ID ${ticket.id} ha sido regalado exitosamente.`,
      });
      fetchTickets(); // Volver a cargar los tickets
    } catch (error) {
      console.error("Error al regalar el ticket:", error);
      Swal.fire({
        icon: "error",
        title: "Error",
        text: "No se pudo regalar el ticket. Por favor, inténtalo de nuevo.",
      });
    }
  }
};

return (
  <div className="container">
    <h2>Detalles de Tickets</h2>
    <h3>Nombre del Cajero: {user && user.name ? user.name : "Cargando..."}</h3>

    {/* Filtro por Nombre de Show */}
    <div className="filter-container">
      <label>Filtrar por Show:</label>
      <input
        type="text"
        value={showFilter}
        onChange={(e) => setShowFilter(e.target.value)}
        placeholder="Buscar Show"
      />
    </div>

    <div style={{ display: "flex", gap: "20px", marginBottom: "20px" }}>
      {/* Filtro de División */}
      <div>
        <label>Filtrar por División:</label>
        <select
          value={divisionFilter}
          onChange={(e) => setDivisionFilter(e.target.value)}
        >
          <option value="">Todas las divisiones</option>
          {divisions.map((division, index) => (
            <option key={index} value={division}>
              {division}
            </option>
          ))}
        </select>
      </div>

      {/* Filtro de Fecha */}
      <div>
        <label>Filtrar por Fecha :</label>
        <select
          value={dateFilter}
          onChange={(e) => setDateFilter(e.target.value)}
        >
          <option value="">Todas las fechas y Horarios</option>
          {date.map((date, index) => (
            <option key={index} value={date}>
              {date}
            </option>
          ))}
        </select>
      </div>

      <div>
  <label>Filtrar por Usuario:</label>
  <select
  value={cashierFilter}
  onChange={(e) => setCashierFilter(e.target.value)}
>
  <option value="">Todos los usuarios</option>
  {users.length > 0 ? (
    users
      .filter((user) => !user.cashier) // Filtra solo los usuarios no cajeros
      .map((user) => (
        <option key={user.id} value={user.name}>
          {user.name}(Usuario)
        </option>
      ))
  ) : (
    <option value="">No hay usuarios disponibles</option>
  )}
</select>
</div>


      {/* Filtro de Cajero */}
      <div>
        <label>Filtrar por Cajero:</label>
        <select
          value={cashierFilter}
          onChange={(e) => setCashierFilter(e.target.value)}
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

      {/* Filtro de Estado */}
      <div>
        <label>Filtrar/Estado:</label>
        <select
          value={canceledFilter}
          onChange={(e) => setCanceledFilter(e.target.value === "null" ? null : e.target.value)}
        >
          <option value="true"> Activos</option>
          <option value="false">Cancelados</option>
        </select>
      </div>
    </div>
      {/* Filtro de Tickets Regalados */}
<div>
  <label>Filtrar por Regalado:</label>
  <select
    value={giftedFilter}
    onChange={(e) => setGiftedFilter(e.target.value === "null" ? null : e.target.value)}
  >
    <option value="null">Ninguno</option>
    <option value="true">Regalados</option>
    {/* <option value="false">No Regalados</option> */}
    
  </select>
</div>

    {/* Mostrar Tickets No Cancelados */}
    <h3>Tickets totales:</h3>
    <table className="table">
      <thead>
        <tr>
          <th>Show</th>
          <th>División</th>
          <th>Fila</th>
          <th>Asiento</th>
          <th>Cajero</th>
          <th>Fecha</th>
          <th>Hora</th>
          <th>Acciones</th>
        </tr>
      </thead>
      <tbody>
        {currentTickets.map((ticket, index) => {
          const show = shows.find((show) => show.id === ticket.showId);
          const [date, time] = ticket.date && ticket.date.includes(" || ") ? ticket.date.split(" || ") : ["", ""];
          return (
            <tr key={ticket.id}>
              <td>{show ? show.name : "Cargando..."}</td>
              <td>{ticket.division}</td>
              <td>{ticket.row}</td>
              <td>{ticket.seat}</td>
              <td>{ticket.userId ? users.find(user => user.id === ticket.userId)?.name : "Cajero Desconocido"}</td>
              <td>{date}</td>
              <td>{time}</td>
              <td>
                <button
                  onClick={() => cancelTicket(ticket)}
                  className="cancel-button"
                >
                  Cancelar Ticket
                </button>

                {/* Botón Regalar Ticket */}
          <button
            onClick={() => giftTicket(ticket)}
            className="cancel-button"
          >
            Regalar.  Ticket.
          </button>
              </td>
            </tr>
          );
        })}
      </tbody>
    </table>

    {/* Descargar Excel */}
    <button onClick={handleDownloadExcel} className="download-button">
      📥 Descargar Excel
    </button>

    {/* Paginación */}
    <div className="pagination">
      <button
        onClick={() => handlePageChange(currentPage - 1)}
        disabled={currentPage === 1}
      >
        ◀ Anterior
      </button>

      {Array.from({ length: endPage - startPage + 1 }, (_, index) => (
        <button
          key={startPage + index}
          onClick={() => handlePageChange(startPage + index)}
          className={currentPage === startPage + index ? "active" : "inactive"}
        >
          {startPage + index}
        </button>
      ))}

      <button
        onClick={() => handlePageChange(currentPage + 1)}
        disabled={currentPage === totalPages}
      >
        Siguiente ▶
      </button>
    </div>

    {/* Mostrar Tickets Cancelados */}
    {canceledFilter !== "true" && canceledFilter !== null && (
      <div>
        <h3>Tickets Cancelados:</h3>
        <table className="table">
          <thead>
            <tr>
              <th>Show</th>
              <th>División</th>
              <th>Fila</th>
              <th>Asiento</th>
              <th>Cajero</th>
              <th>Fecha</th>
              <th>Hora</th>
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {cancelledTickets.map((ticket) => {
              const [date, time] = ticket.date && ticket.date.includes(" || ") ? ticket.date.split(" || ") : ["", ""];
              const show = shows.find((show) => show.id === ticket.showId);
              return (
                <tr key={ticket.id}>
                  <td>{show ? show.name : "Cargando..."}</td>
                  <td>{ticket.division}</td>
                  <td>{ticket.row}</td>
                  <td>{ticket.seat}</td>
                  <td>
                  {ticket ? (
                   <>
                   {ticket.name} {ticket.cashier ? "" : "(Usuario)"}
                  </>
                    ) : (
                    "Cajero Desconocido"
                    )}
                  </td>
                  <td>{date}</td>
                  <td>{time}</td>
                  <td style={{ color: 'red' }}>Cancelado</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    )}
  </div>
);
};

export default SoldTickets;
                    
                      
