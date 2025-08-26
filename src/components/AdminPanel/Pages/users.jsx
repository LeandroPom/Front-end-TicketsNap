import React, { useState, useEffect, useRef } from "react";
import axios from "axios";
import { useSelector } from "react-redux";
import Swal from "sweetalert2";
import * as XLSX from "xlsx";

const UsersManagement = () => {
  const [allUsers, setAllUsers] = useState([]);
  const [users, setUsers] = useState([]);
  const [search, setSearch] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const usersPerPage = 5;
  const [passwordChanges, setPasswordChanges] = useState({});

  const user = useSelector((state) => state.user);
  const searchTimeout = useRef(null);

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      const response = await axios.get(`/users`);
      setAllUsers(response.data);
      setUsers(response.data);
    } catch (error) {
      console.error("Error fetching users:", error);
      Swal.fire({
        icon: "error",
        title: "Error",
        text: "No se pudieron cargar los usuarios.",
      });
    }
  };

  // Actualizaci贸n de usuario
  const updateUser = async (id, updates) => {
    if (!user?.isAdmin) {
      Swal.fire({
        icon: "error",
        title: "Permiso Denegado",
        text: "Solo los administradores pueden realizar esta accion.",
      });
      return;
    }
    try {
      await axios.put(`/users/edit`, { id, updates, user: { isAdmin: user.isAdmin } });
      fetchUsers();
      Swal.fire({
        icon: "success",
        title: "Actualizacion exitosa",
        text: `El usuario ha sido actualizado correctamente.`,
      });
    } catch (error) {
      console.error("Error al actualizar el usuario:", error);
      Swal.fire({
        icon: "error",
        title: "Error",
        text: "No se pudo actualizar el usuario.",
      });
    }
  };

  const handleRoleChange = (userId, role) => {
    const userToUpdate = users.find((u) => u.id === userId);
    updateUser(userId, { [role]: !userToUpdate[role] });
  };

  const handleDisableToggle = (userId) => {
    const userToUpdate = users.find((u) => u.id === userId);
    updateUser(userId, { disabled: !userToUpdate.disabled });
  };

  const handlePasswordInputChange = (userId, value) => {
    setPasswordChanges((prev) => ({ ...prev, [userId]: value }));
  };

  const handlePasswordUpdate = (userId) => {
    const newPassword = passwordChanges[userId];
    if (!newPassword || newPassword.trim().length < 6) {
      Swal.fire({
        icon: "warning",
        title: "Contraseña invalida",
        text: "La contraseña debe tener al menos 6 caracteres.",
      });
      return;
    }
    updateUser(userId, { password: newPassword });
    setPasswordChanges((prev) => ({ ...prev, [userId]: "" }));
  };

  // B煤squeda con debounce y reinicio de paginaci贸n
  useEffect(() => {
    if (searchTimeout.current) clearTimeout(searchTimeout.current);
    searchTimeout.current = setTimeout(() => {
      const searchLower = search.toLowerCase();
      const filtered = allUsers.filter(
        (u) =>
          u.name.toLowerCase().includes(searchLower) ||
          u.email.toLowerCase().includes(searchLower) ||
          (u.phone && u.phone.toLowerCase().includes(searchLower))
      );
      setUsers(filtered);
      setCurrentPage(1);
    }, 300);
  }, [search, allUsers]);

  // Paginaci贸n
  const indexOfLastUser = currentPage * usersPerPage;
  const indexOfFirstUser = indexOfLastUser - usersPerPage;
  const currentUsers = users.slice(indexOfFirstUser, indexOfLastUser);
  const totalPages = Math.ceil(users.length / usersPerPage);

  const paginate = (pageNumber) => {
    if (pageNumber < 1 || pageNumber > totalPages) return;
    setCurrentPage(pageNumber);
  };

  const handleDownloadExcel = () => {
    const data = users.map((user) => ({
      Nombre: user.name,
      Email: user.email,
      Estado: user.disabled ? "Deshabilitado" : "Activo",
      Administrador: user.isAdmin ? "S铆" : "No",
      Cajero: user.cashier ? "S铆" : "No",
      Phone: user.phone,
    }));

    const worksheet = XLSX.utils.json_to_sheet(data);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Usuarios");
    XLSX.writeFile(workbook, "usuarios.xlsx");
  };

  return (
    <div
      className="min-h-screen p-4 md:p-6 w-full max-w-screen-xl mx-auto relative top-[220px] z-10 container-bg backdrop-blur-sm"
      style={{ background: "rgba(12,35,66,0.6)", WebkitBackdropFilter: "blur(10px)", backdropFilter: "blur(10px)" }}
    >
      <h2 className="text-3xl font-bold mb-6 text-center w-full max-w-6xl px-4 text-white">
        Gestion de Usuarios
      </h2>

      {/* Barra de b煤squeda */}
      <div className="w-full max-w-6xl px-4 mb-4">
        <input
          type="text"
          placeholder="Buscar por nombre, email o telefono..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full sm:w-1/2 p-2 rounded bg-[#608CC4] text-white border border-white"
          autoComplete="off"
        />
      </div>

      {/* Tabla */}
      <div className="w-full max-w-6xl px-4 overflow-x-auto rounded-lg shadow-md p-6 container-bg">
        <table className="min-w-full text-left border border-white text-sm sm:text-base">
          <thead className="bg-[#608CC4]">
            <tr>
              <th className="text-white p-3 border-b border-white">Nombre</th>
              <th className="text-white p-3 border-b border-white">Telefono</th>
              <th className="text-white p-3 border-b border-white">Estado</th>
              <th className="text-white p-3 border-b border-white">Administrador</th>
              <th className="text-white p-3 border-b border-white">Email</th>
              <th className="text-white p-3 border-b border-white">Cajero</th>
              <th className="text-white p-3 border-b border-white">Acciones</th>
              <th className="text-white p-3 border-b border-white">Contraseña</th>
            </tr>
          </thead>
          <tbody>
            {currentUsers.length === 0 ? (
              <tr>
                <td colSpan={8} className="text-center text-white p-4">
                  No se encontraron usuarios.
                </td>
              </tr>
            ) : (
              currentUsers.map((user) => (
                <tr key={user.id} className="hover:bg-[#ADC8E6] transition">
                  <td className="p-3 border-b border-white">{user.name}</td>
                  <td className="p-3 border-b border-white">{user.email}</td>
                  <td className="p-3 border-b border-white">{user.phone || "No disponible"}</td>
                  <td className="p-3 border-b border-white">{user.disabled ? "Deshabilitado" : "Activo"}</td>
                  <td className="p-3 border-b border-white">
                    <button
                      className="secondary py-1 px-3"
                      onClick={() => handleRoleChange(user.id, "isAdmin")}
                    >
                      {user.isAdmin ? "Quitar Admin" : "Asignar Admin"}
                    </button>
                  </td>
                  <td className="p-3 border-b border-white">
                    <button
                      className="secondary py-1 px-3"
                      onClick={() => handleRoleChange(user.id, "cashier")}
                    >
                      {user.cashier ? "Quitar Cajero" : "Asignar Cajero"}
                    </button>
                  </td>
                  <td className="p-3 border-b border-white">
                    <button
                      className="secondary py-1 px-3"
                      onClick={() => handleDisableToggle(user.id)}
                    >
                      {user.disabled ? "Habilitar" : "Deshabilitar"}
                    </button>
                  </td>
                  <td className="p-3 border-b border-white min-w-[220px]">
                    <div className="flex flex-col gap-2">
                      <input
                        type="password"
                        placeholder="Nueva contraseña"
                        value={passwordChanges[user.id] || ""}
                        onChange={(e) => handlePasswordInputChange(user.id, e.target.value)}
                        className="p-2 rounded bg-[#608CC4] text-white border border-white"
                      />
                      <button
                        className="secondary py-1 px-3"
                        onClick={() => handlePasswordUpdate(user.id)}
                      >
                        Cambiar
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Bot贸n de exportaci贸n */}
      <div className="w-full max-w-6xl px-4 flex justify-end mt-4">
        <button onClick={handleDownloadExcel} className="secondary py-2 px-4">
          Descargar Excel
        </button>
      </div>

      {/* Paginaci贸n */}
      <div className="w-full max-w-6xl px-4 flex flex-wrap justify-center gap-2 mt-4">
        <button
          onClick={() => paginate(currentPage - 1)}
          disabled={currentPage === 1}
          className={`px-4 py-2 rounded-full ${currentPage === 1 ? 'bg-gray-400 cursor-not-allowed' : 'secondary'}`}
        >
          Anterior
        </button>

        {currentPage > 3 && (
          <button onClick={() => paginate(1)} className="px-4 py-2 rounded-full secondary">
            Primera
          </button>
        )}

        {(() => {
          const pageNumbers = [];
          const maxButtons = 5;
          let startPage = Math.max(1, currentPage - 2);
          let endPage = Math.min(totalPages, currentPage + 2);

          if (currentPage <= 3) endPage = Math.min(totalPages, maxButtons);
          if (currentPage >= totalPages - 2) startPage = Math.max(1, totalPages - maxButtons + 1);

          for (let i = startPage; i <= endPage; i++) pageNumbers.push(i);

          return pageNumbers.map((page) => (
            <button
              key={page}
              onClick={() => paginate(page)}
              className={`px-4 py-2 rounded-full font-bold ${page === currentPage ? 'pagina' : 'secondary'}`}
            >
              {page}
            </button>
          ));
        })()}

        {currentPage < totalPages - 2 && (
          <button onClick={() => paginate(totalPages)} className="px-4 py-2 rounded-full secondary">
          Ultima
          </button>
        )}

        <button
          onClick={() => paginate(currentPage + 1)}
          disabled={currentPage === totalPages || totalPages === 0}
          className={`px-4 py-2 rounded-full ${currentPage === totalPages || totalPages === 0 ? 'bg-gray-400 cursor-not-allowed' : 'secondary'}`}
        >
          Siguiente
        </button>
      </div>
    </div>
  );


};

export default UsersManagement;