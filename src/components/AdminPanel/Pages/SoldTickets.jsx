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
  const [userFilter, setUserFilter] = useState("");

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
  }, [divisionFilter, canceledFilter, showFilter, tickets, dateFilter, cashierFilter, userFilter]); // Incluir cashierFilter en las dependencias

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

  // Filtro por división (para tribunas generales)
  if (divisionFilter) {
    filtered = filtered.filter(ticket => ticket.division === divisionFilter);
  }

  // Si el ticket no tiene fila ni asiento (caso de tribunas generales), no agrupamos
  const tribunasGenerales = filtered.filter(ticket => !ticket.row && !ticket.seat);

  // Filtro por cancelación si se aplica
  if (canceledFilter !== null) {
    const filterState = canceledFilter === "true";
    filtered = filtered.filter(ticket => ticket.state === filterState);
  }

  // Filtro por fecha
  if (dateFilter) {
    filtered = filtered.filter(ticket => ticket.date === dateFilter);
  }

    // Filtrar por Cajero si se está aplicando
    if (cashierFilter) {
      filtered = filtered.filter(ticket => ticket.userId === cashierFilter);
    }
  
    // Filtrar por usuario común si se selecciona un usuario (y no un cajero)
    if (userFilter) {
      filtered = filtered.filter(ticket => ticket.userId === userFilter);
      
    }

  // Filtro por nombre del show
  if (showFilter) {
    filtered = filtered.filter(ticket => {
      const show = shows.find((show) => show.id === ticket.showId);
      return show && show.name.toLowerCase().includes(showFilter.toLowerCase());
    });
  }

  // Agrupar los tickets que son para tribunas generales sin filas ni asientos
  const noCancelled = tribunasGenerales.filter(ticket => ticket.state === true);
  const cancelled = tribunasGenerales.filter(ticket => ticket.state === false);

  // Aquí agregamos los tickets normales que sí tienen fila y asiento
  const noCancelledWithSeats = filtered.filter(ticket => ticket.row && ticket.seat && ticket.state === true);
  const cancelledWithSeats = filtered.filter(ticket => ticket.row && ticket.seat && ticket.state === false);

  // Ahora combinamos los resultados
  setNoCancelledTickets([...noCancelled, ...noCancelledWithSeats]);
  setCancelledTickets([...cancelled, ...cancelledWithSeats]);
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
// Paginación
const [currentPage, setCurrentPage] = useState(1);
const ticketsPerPage = 5;

// Aplicamos todos los filtros sobre los tickets

const ticketsFiltered = noCancelledTickets.filter(ticket => {
  // Filtro por Tickets Regalados (price === 0)
  if (giftedFilter !== null) {
    if (giftedFilter === "true" && ticket.price !== 0) return false;
    if (giftedFilter === "false" && ticket.price === 0) return false;
  }

  // Filtro por división
  if (divisionFilter && ticket.division !== divisionFilter) return false;

  // Filtro por cancelación
  if (canceledFilter !== null && ticket.state !== canceledFilter) return false;

  // Filtro por fecha
  if (dateFilter && ticket.date !== dateFilter) return false;

  // Filtrar por Cajero
  if (cashierFilter && ticket.userId !== cashierFilter) return false;

  // Filtrar por usuario
  if (userFilter && ticket.userId !== userFilter) return false;

  // Filtro por nombre del show
  if (showFilter && shows) {
    const show = shows.find(show => show.id === ticket.showId);
    if (!show || !show.name.toLowerCase().includes(showFilter.toLowerCase())) return false;
  }

  return true;
});

// Paginación sobre los tickets filtrados
const totalPages = Math.ceil(ticketsFiltered.length / ticketsPerPage);
const currentTickets = ticketsFiltered.slice((currentPage - 1) * ticketsPerPage, currentPage * ticketsPerPage);

// Lógica para definir el rango de páginas visibles
const maxVisiblePages = 3;
let startPage = Math.max(1, currentPage - Math.floor(maxVisiblePages / 2));
let endPage = Math.min(totalPages, startPage + maxVisiblePages - 1);

if (endPage - startPage + 1 < maxVisiblePages) {
  startPage = Math.max(1, endPage - maxVisiblePages + 1);
}

// Cambiar de página
const handlePageChange = (pageNumber) => {
  if (pageNumber >= 1 && pageNumber <= totalPages) {
    setCurrentPage(pageNumber);
  }
};

const handleDownloadExcel = () => {
  let filteredData = tickets;

  if (giftedFilter !== null) {
    const filterGifted = giftedFilter === "true";
    filteredData = filteredData.filter(ticket =>
      (giftedFilter === "true" && ticket.price === 0) || 
      (giftedFilter === "false" && ticket.price !== 0)
    );
  }

  if (divisionFilter) filteredData = filteredData.filter(ticket => ticket.division === divisionFilter);
  if (canceledFilter !== null) filteredData = filteredData.filter(ticket => ticket.state === canceledFilter === "true");
  if (dateFilter) filteredData = filteredData.filter(ticket => ticket.date === dateFilter);
  if (cashierFilter) filteredData = filteredData.filter(ticket => ticket.userId === cashierFilter);
  if (userFilter) filteredData = filteredData.filter(ticket => ticket.userId === userFilter);  // Filter by user

  // Aplicar el filtro por nombre del show para generar el excel
  if (showFilter && shows) {
    filteredData = filteredData.filter(ticket => {
      const show = shows.find(show => show.id === ticket.showId);
      return show && show.name.toLowerCase().includes(showFilter.toLowerCase());
    });
  }
  
  filteredData = filteredData.filter(ticket => ticket.state === true);

  // Función para preparar los datos con el 20% de aumento
  const prepareDataForExport = (data) => {
    return data.map(ticket => {
      const priceWithTax = ticket.price * 1.20;
      const user = users.find(user => user.id === ticket.userId);
      const userName = user ? user.name : "Sin Cajero";
      const userType = user && user.cashier ? `Cajero: ${userName}` : `Usuario: ${userName}`;

      return {
        Show: shows.find(show => show.id === ticket.showId)?.name || "Cargando...",
        Division: ticket.division || "Desconocida",
        Row: ticket.row || "Libre",
        Seat: ticket.seat || "Libre",
        Price: priceWithTax.toFixed(2),
        Usuario: userType,
        Date: ticket.date.split(" || ")[0] || "Fecha no disponible",
        Time: ticket.date.split(" || ")[1] || "Hora no disponible",
      };
    });
  };

  const dataForCashiers = prepareDataForExport(filteredData.filter(ticket => users.find(user => user.id === ticket.userId && user.cashier)));
  const dataForUsers = prepareDataForExport(filteredData.filter(ticket => users.find(user => user.id === ticket.userId && !user.cashier)));

  // Calcular el total con los precios ya con el 20% añadido para cada grupo
  const totalPriceCashiers = dataForCashiers.reduce((acc, ticket) => acc + parseFloat(ticket.Price), 0);
  const totalPriceUsers = dataForUsers.reduce((acc, ticket) => acc + parseFloat(ticket.Price), 0);

  // Añadir una fila al final con el total para cada grupo
  dataForCashiers.push({
    Show: "Total",
    Division: "",
    Row: "",
    Seat: "",
    Price: totalPriceCashiers.toFixed(2),  // El total ya con el 20% incluido
    Usuario: "",
    Date: "",
    Time: "",
  });

  dataForUsers.push({
    Show: "Total",
    Division: "",
    Row: "",
    Seat: "",
    Price: totalPriceUsers.toFixed(2),  // El total ya con el 20% incluido
    Usuario: "",
    Date: "",
    Time: "",
  });

  // Crear el libro de trabajo de Excel
  const workbook = XLSX.utils.book_new();

  // Agregar las hojas de datos: una para Cajeros y otra para Usuarios
  if (dataForCashiers.length > 0) {
    const cashierSheet = XLSX.utils.json_to_sheet(dataForCashiers);
    XLSX.utils.book_append_sheet(workbook, cashierSheet, "Cajeros");
  }

  if (dataForUsers.length > 0) {
    const userSheet = XLSX.utils.json_to_sheet(dataForUsers);
    XLSX.utils.book_append_sheet(workbook, userSheet, "Usuarios");
  }

  // Descargar el archivo Excel
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

const resetFilters = () => {
  setDivisionFilter("");
  setDateFilter("");
  setCashierFilter("");
  setCanceledFilter(null);
  setShowFilter("");
  setGiftedFilter(null);
  setUserFilter("");
};


const handleUserFilterChange = (e) => {
  const selectedUser = e.target.value;
  setUserFilter(selectedUser ? selectedUser : ""); // No necesitas parsear a número si estás pasando string
  console.log("Usuario seleccionado:", selectedUser);
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
  <select value={userFilter} onChange={(e) => setUserFilter(e.target.value ? Number(e.target.value) : "")}>
  <option value="">Todos los usuarios</option>
  {users.length > 0 ? (
    users
      .filter((user) => user.cashier === false) // Filtra solo los usuarios no cajeros
      .map((user) => (
        <option key={user.id} value={user.id}>
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
        <select value={cashierFilter} onChange={(e) => setCashierFilter(e.target.value ? Number(e.target.value) : "")}>
  <option value="">Todos los cajeros y usuarios</option>

  {users.length > 0 ? (
    users
      .filter((user) => user.cashier === true) // Filtramos solo los usuarios con cashier en true
      .map((user) => (
        <option key={user.id} value={user.id}>
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
            {/* Botón para resetear los filtros */}
  <div>
    <button onClick={resetFilters} className="cancel-button">
      Resetear Filtros
    </button>
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
    const isTribunaGeneral = !ticket.row && !ticket.seat;
    return (
      <tr key={ticket.id}>
        <td>{show ? show.name : "Cargando..."}</td>
        <td>{ticket.division}</td>
        <td>{isTribunaGeneral ? "Libre" : ticket.row}</td>
        <td>{isTribunaGeneral ? "Libre" : ticket.seat}</td>
        <td>
  {ticket.userId 
    ? users.find(user => user.id === ticket.userId)
        ? (
            <>
              {users.find(user => user.id === ticket.userId)?.name} 
              {/* Comprobamos si el usuario no es cajero */}
              {users.find(user => user.id === ticket.userId)?.cashier === false ? "(Usuario)" : ""}
            </>
          )
        : "Cajero Desconocido"
    : "Cajero Desconocido"}
</td>
        <td>{date}</td>
        <td>{time}</td>
              <td>
                {/* Mostrar botones solo si el usuario es administrador */}
            {user.isAdmin && (
              <>
                <button
                  onClick={() => cancelTicket(ticket)}
                  className="cancel-button"
                >
                  Cancelar Ticket
                </button>

                <button
                  onClick={() => giftTicket(ticket)}
                  className="cancel-button"
                >
                  Regalar Ticket
                </button>
              </>
            )}
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

    <div className="pagination">
    {/* Botón para la página anterior */}
    <button
      onClick={() => handlePageChange(currentPage - 1)}
      disabled={currentPage === 1}
    >
      ◀ Anterior
    </button>

    {/* Páginas visibles */}
    {Array.from({ length: endPage - startPage + 1 }, (_, index) => (
      <button
        key={startPage + index}
        onClick={() => handlePageChange(startPage + index)}
        className={currentPage === startPage + index ? "active" : "inactive"}
      >
        {startPage + index}
      </button>
    ))}

    {/* Botón para la página siguiente */}
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