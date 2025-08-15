import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import axios from "axios";
import Swal from "sweetalert2";
import { getShows } from "../../Redux/Actions/actions"; // Importar la acción para traer los shows
import * as XLSX from "xlsx";


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
      // Buscar el show asociado al ticket
      const show = shows.find(s => s.id === ticket.showId);
     

      if (!show) {
        throw new Error(`El show con ID ${ticket.showId} no existe.`);
      }

      // Elegir endpoint según la propiedad isGeneral
      if (show.isGeneral) {
        
        await axios.delete(`/tickets/cancel/general/${ticket.id}`);
      } else {
        
        await axios.delete(`/tickets/cancel/${ticket.id}`);
      }

      Swal.fire({
        icon: "success",
        title: "Ticket Cancelado",
        text: `El ticket con ID ${ticket.id} ha sido cancelado exitosamente.`,
      });

      fetchTickets(); // Refrescar tickets después de cancelar
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
      const userEmail = user ? user.email : "Sin correo";
      const userPhone = user ? user.phone : "Sin Celular";
      const userType = user && user.cashier ? `Cajero: ${userName}` : `Nombre: ${userName}`;

      return {
        Show: shows.find(show => show.id === ticket.showId)?.name || "Cargando...",
        Division: ticket.division || "Desconocida",
        Fila: ticket.row || "Libre",
        Asiento: ticket.seat || "Libre",
        Price: priceWithTax.toFixed(2),
        Usuario: userType,
        Email: userEmail,
        Telefono: userPhone,
        Fecha: ticket.date.split(" || ")[0] || "Fecha no disponible",
        Hora: ticket.date.split(" || ")[1] || "Hora no disponible",
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
    Fila: "",
    Asiento: "",
    Price: totalPriceCashiers.toFixed(2),  // El total ya con el 20% incluido
    Usuario: "",
    Fecha: "",
    Hora: "",
  });

  dataForUsers.push({
    Show: "Total",
    Division: "",
    Fila: "",
    Asiento: "",
    Price: totalPriceUsers.toFixed(2),  // El total ya con el 20% incluido
    Usuario: "",
    Fecha: "",
    Hora: "",
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
  
};

return (
  <div
  className="
    min-h-screen p-4 md:p-6
    w-full max-w-screen-xl
    mx-auto
    relative
    top-[170px]
    z-10
  "
  style={{
    background: "rgba(86, 86, 190, 0.4)",
    backdropFilter: "blur(10px)",
    WebkitBackdropFilter: "blur(10px)",
  }}
>
    <h2 className="text-white text-2xl font-bold mb-6">Detalles de Tickets</h2>
    <h3 className="text-white mb-4">
      Nombre del Cajero: {user && user.name ? user.name : "Cargando..."}
    </h3>

    {/* Filtros */}
    <div className="flex flex-wrap gap-6 mb-6">
      <div className="flex flex-col">
        <label className="text-white mb-1">Filtrar por Show:</label>
        <input
          type="text"
          value={showFilter}
          onChange={(e) => setShowFilter(e.target.value)}
          placeholder="Buscar Show"
          className="p-2 rounded bg-[rgba(90,90,170,0.7)] text-white border border-white focus:outline-none focus:ring-2 focus:ring-blue-400"
        />
      </div>

      <div className="flex flex-col">
        <label className="text-white mb-1">Filtrar por División:</label>
        <select
          value={divisionFilter}
          onChange={(e) => setDivisionFilter(e.target.value)}
          className="p-2 rounded bg-[rgba(90,90,170,0.7)] text-white border border-white focus:outline-none focus:ring-2 focus:ring-blue-400"
        >
          <option value="">Todas las divisiones</option>
          {divisions.map((division, index) => (
            <option key={index} value={division}>
              {division}
            </option>
          ))}
        </select>
      </div>

      <div className="flex flex-col">
        <label className="text-white mb-1">Filtrar por Fecha:</label>
        <select
          value={dateFilter}
          onChange={(e) => setDateFilter(e.target.value)}
          className="p-2 rounded bg-[rgba(90,90,170,0.7)] text-white border border-white focus:outline-none focus:ring-2 focus:ring-blue-400"
        >
          <option value="">Todas las fechas y Horarios</option>
          {date.map((date, index) => (
            <option key={index} value={date}>
              {date}
            </option>
          ))}
        </select>
      </div>

      <div className="flex flex-col">
        <label className="text-white mb-1">Filtrar por Usuario:</label>
        <select
          value={userFilter}
          onChange={(e) => setUserFilter(e.target.value ? Number(e.target.value) : "")}
          className="p-2 rounded bg-[rgba(90,90,170,0.7)] text-white border border-white focus:outline-none focus:ring-2 focus:ring-blue-400"
        >
          <option value="">Todos los usuarios</option>
          {users.length > 0 ? (
            users
              .filter((user) => !user.cashier)
              .map((user) => (
                <option key={user.id} value={user.id}>
                  {user.name} (Usuario)
                </option>
              ))
          ) : (
            <option value="">No hay usuarios disponibles</option>
          )}
        </select>
      </div>

      <div className="flex flex-col">
        <label className="text-white mb-1">Filtrar por Cajero:</label>
        <select
          value={cashierFilter}
          onChange={(e) => setCashierFilter(e.target.value ? Number(e.target.value) : "")}
          className="p-2 rounded bg-[rgba(90,90,170,0.7)] text-white border border-white focus:outline-none focus:ring-2 focus:ring-blue-400"
        >
          <option value="">Todos los cajeros y usuarios</option>
          {users.length > 0 ? (
            users
              .filter((user) => user.cashier)
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

      <div className="flex flex-col">
        <label className="text-white mb-1">Filtrar/Estado:</label>
        <select
          value={canceledFilter}
          onChange={(e) => setCanceledFilter(e.target.value === "null" ? null : e.target.value)}
          className="p-2 rounded bg-[rgba(90,90,170,0.7)] text-white border border-white focus:outline-none focus:ring-2 focus:ring-blue-400"
        >
          <option value="true">Activos</option>
          <option value="false">Cancelados</option>
        </select>
      </div>

      <div className="flex flex-col">
        <label className="text-white mb-1">Filtrar por Regalado:</label>
        <select
          value={giftedFilter}
          onChange={(e) => setGiftedFilter(e.target.value === "null" ? null : e.target.value)}
          className="p-2 rounded bg-[rgba(90,90,170,0.7)] text-white border border-white focus:outline-none focus:ring-2 focus:ring-blue-400"
        >
          <option value="null">Ninguno</option>
          <option value="true">Regalados</option>
        </select>
      </div>

      <div className="flex items-end">
        <button
          onClick={resetFilters}
          className="bg-blue-600 hover:bg-blue-800 text-white px-4 py-2 rounded ml-2"
          style={{ minHeight: '38px' }}
        >
          Resetear Filtros
        </button>
      </div>
    </div>

    {/* Tickets totales */}
    <h3 className="text-white font-semibold mb-2">Tickets totales:</h3>
    <div className="overflow-x-auto">
      <table className="min-w-full text-white border border-white rounded-lg">
        <thead className="bg-[rgba(70,70,140,0.8)]">
          <tr>
            {["Show", "División", "Fila", "Asiento", "Cajero", "Fecha", "Hora", "Acciones"].map((head) => (
              <th key={head} className="p-3 border border-white text-gray-400 whitespace-nowrap">
                {head}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {currentTickets.map((ticket) => {
            const show = shows.find((show) => show.id === ticket.showId);
            const [date, time] = ticket.date && ticket.date.includes(" || ") ? ticket.date.split(" || ") : ["", ""];
            const isTribunaGeneral = !ticket.row && !ticket.seat;
            return (
              <tr key={ticket.id} className="hover:bg-[rgba(90,90,170,0.3)] transition-colors">
                <td className="p-2 border border-white">{show ? show.name : "Cargando..."}</td>
                <td className="p-2 border border-white">{ticket.division}</td>
                <td className="p-2 border border-white">{isTribunaGeneral ? "Libre" : ticket.row}</td>
                <td className="p-2 border border-white">{isTribunaGeneral ? "Libre" : ticket.seat}</td>
                <td className="p-2 border border-white">
                  {ticket.userId
                    ? users.find((u) => u.id === ticket.userId)
                      ? `${users.find((u) => u.id === ticket.userId)?.name} ${
                          users.find((u) => u.id === ticket.userId)?.cashier === false ? "(Usuario)" : ""
                        }`
                      : "Cajero Desconocido"
                    : "Cajero Desconocido"}
                </td>
                <td className="p-2 border border-white">{date}</td>
                <td className="p-2 border border-white">{time}</td>
                <td className="p-2 border border-white">
                  {user.isAdmin && (
                    <div className="flex flex-col gap-2">
                      <button
                        onClick={() => cancelTicket(ticket)}
                        className=" bg-blue-800 hover:bg-blue-900 text-white px-3 py-1 rounded"
                      >
                        Cancelar Ticket
                      </button>
                      <button
                        onClick={() => giftTicket(ticket)}
                        className=" bg-blue-800 hover:bg-blue-900 text-white px-3 py-1 rounded"
                      >
                        Regalar Ticket
                      </button>
                    </div>
                  )}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>

    {/* Descargar Excel */}
    <button
      onClick={handleDownloadExcel}
      className="bg-blue-700 hover:bg-blue-800 text-white px-5 py-2 rounded mt-6"
    >
      📥 Descargar Excel
    </button>

    {/* Paginación */}
    <div className="flex justify-center gap-2 mt-6 flex-wrap">
      <button
        onClick={() => handlePageChange(currentPage - 1)}
        disabled={currentPage === 1}
        className={`px-4 py-2 rounded-full ${
          currentPage === 1 ? "bg-gray-400 cursor-not-allowed" : "bg-[rgba(90,90,170,0.7)] hover:bg-[rgba(110,110,190,0.9)] text-white"
        }`}
      >
        ◀ Anterior
      </button>
      {Array.from({ length: endPage - startPage + 1 }, (_, i) => {
        const page = startPage + i;
        return (
          <button
            key={page}
            onClick={() => handlePageChange(page)}
            className={`px-4 py-2 rounded-full font-bold ${
              page === currentPage
                ? "bg-[rgba(110,110,190,0.9)] text-white"
                : "bg-[rgba(90,90,170,0.7)] hover:bg-[rgba(110,110,190,0.9)] text-white"
            }`}
          >
            {page}
          </button>
        );
      })}
      <button
        onClick={() => handlePageChange(currentPage + 1)}
        disabled={currentPage === totalPages}
        className={`px-4 py-2 rounded-full ${
          currentPage === totalPages ? "bg-gray-400 cursor-not-allowed" : "bg-[rgba(90,90,170,0.7)] hover:bg-[rgba(110,110,190,0.9)] text-white"
        }`}
      >
        Siguiente ▶
      </button>
    </div>

    {/* Tickets cancelados (solo si aplican) */}
    {canceledFilter !== "true" && canceledFilter !== null && (
      <div className="mt-8">
        <h3 className="text-white font-semibold mb-2">Tickets Cancelados:</h3>
        <div className="overflow-x-auto">
          <table className="min-w-full text-white border border-white rounded-lg">
            <thead className="bg-[rgba(70,70,140,0.8)]">
              <tr>
                {["Show", "División", "Fila", "Asiento", "Cajero", "Fecha", "Hora", "Acciones"].map((head) => (
                  <th key={head} className="p-3 border border-white text-white whitespace-nowrap">
                    {head}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {cancelledTickets.map((ticket) => {
                const [date, time] = ticket.date && ticket.date.includes(" || ") ? ticket.date.split(" || ") : ["", ""];
                const show = shows.find((show) => show.id === ticket.showId);
                return (
                  <tr key={ticket.id} className="hover:bg-[rgba(90,90,170,0.3)] transition-colors">
                    <td className="p-2 border border-white">{show ? show.name : "Cargando..."}</td>
                    <td className="p-2 border border-white">{ticket.division}</td>
                    <td className="p-2 border border-white">{ticket.row}</td>
                    <td className="p-2 border border-white">{ticket.seat}</td>
                    <td className="p-2 border border-white">
                      {ticket ? (
                        <>
                          {ticket.name} {ticket.cashier ? "" : "(Usuario)"}
                        </>
                      ) : (
                        "Cajero Desconocido"
                      )}
                    </td>
                    <td className="p-2 border border-white">{date}</td>
                    <td className="p-2 border border-white">{time}</td>
                    <td className="p-2 border border-white text-red-500 font-semibold">Cancelado</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    )}
  </div>
);

};

export default SoldTickets;