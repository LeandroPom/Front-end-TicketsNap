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

  // Actualización de usuario
  const updateUser = async (id, updates) => {
    if (!user?.isAdmin) {
      Swal.fire({
        icon: "error",
        title: "Permiso Denegado",
        text: "Solo los administradores pueden realizar esta acción.",
      });
      return;
    }
    try {
      await axios.put(`/users/edit`, { id, updates, user: { isAdmin: user.isAdmin } });
      fetchUsers();
      Swal.fire({
        icon: "success",
        title: "Actualización exitosa",
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
        title: "Contraseña inválida",
        text: "La contraseña debe tener al menos 6 caracteres.",
      });
      return;
    }
    updateUser(userId, { password: newPassword });
    setPasswordChanges((prev) => ({ ...prev, [userId]: "" }));
  };

  // Búsqueda con debounce y reinicio de paginación
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

  // Paginación
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
      Administrador: user.isAdmin ? "Sí" : "No",
      Cajero: user.cashier ? "Sí" : "No",
      Phone: user.phone,
    }));

    const worksheet = XLSX.utils.json_to_sheet(data);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Usuarios");
    XLSX.writeFile(workbook, "usuarios.xlsx");
  };

  return (
    <div className="min-h-screen p-4 md:p-6 w-full max-w-screen-xl mx-auto relative top-[170px] z-10"
      style={{ background: "rgba(86, 86, 190, 0.4)", backdropFilter: "blur(10px)", WebkitBackdropFilter: "blur(10px)" }}>
      <h2 className="text-3xl font-bold mb-6 text-center w-full max-w-6xl px-4 text-white">
        Gestión de Usuarios
      </h2>

      {/* Barra de búsqueda */}
      <div className="w-full max-w-6xl px-4 mb-4">
        <input
          type="text"
          placeholder="Buscar por nombre, email o teléfono..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full sm:w-1/2 p-2 rounded bg-[rgb(90,90,170)] text-white border border-white"
          autoComplete="off"
        />
      </div>

      {/* Tabla */}
      <div className="w-full max-w-6xl px-4 overflow-x-auto bg-[rgb(50,50,109)] rounded-lg shadow-md p-6">
        <table className="min-w-full text-left border border-white text-sm sm:text-base">
          <thead className="bg-[rgb(70,70,140)]">
            <tr>
              <th className="text-gray-400 p-3 border-b border-white">Nombre</th>
              <th className="text-gray-400 p-3 border-b border-white">Email</th>
              <th className="text-gray-400 p-3 border-b border-white">Teléfono</th>
              <th className="text-gray-400 p-3 border-b border-white">Estado</th>
              <th className="text-gray-400 p-3 border-b border-white">Administrador</th>
              <th className="text-gray-400 p-3 border-b border-white">Cajero</th>
              <th className="text-gray-400 p-3 border-b border-white">Acciones</th>
              <th className="text-gray-400 p-3 border-b border-white">Contraseña</th>
            </tr>
          </thead>
          <tbody>
            {currentUsers.length === 0 ? (
              <tr>
                <td colSpan={8} className="text-center text-white p-4">
                  No se encontraron usuarios.
                </td>
              </tr>
            ) : currentUsers.map((user) => (
              <tr key={user.id} className="hover:bg-[rgb(60,60,120)] transition">
                <td className="p-3 border-b border-white">{user.name}</td>
                <td className="p-3 border-b border-white">{user.email}</td>
                <td className="p-3 border-b border-white">{user.phone || "No disponible"}</td>
                <td className="p-3 border-b border-white">{user.disabled ? "Deshabilitado" : "Activo"}</td>
                <td className="p-3 border-b border-white">
                  <button
                    className="bg-[rgb(90,90,170)] hover:bg-[rgb(110,110,190)] py-1 px-3 rounded text-white"
                    onClick={() => handleRoleChange(user.id, "isAdmin")}
                  >
                    {user.isAdmin ? "Quitar Admin" : "Asignar Admin"}
                  </button>
                </td>
                <td className="p-3 border-b border-white">
                  <button
                    className="bg-[rgb(90,90,170)] hover:bg-[rgb(110,110,190)] py-1 px-3 rounded text-white"
                    onClick={() => handleRoleChange(user.id, "cashier")}
                  >
                    {user.cashier ? "Quitar Cajero" : "Asignar Cajero"}
                  </button>
                </td>
                <td className="p-3 border-b border-white">
                  <button
                    className="bg-[rgb(90,90,170)] hover:bg-[rgb(110,110,190)] py-1 px-3 rounded text-white"
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
                      className="p-2 rounded bg-[rgb(90,90,170)] text-white border border-white"
                    />
                    <button
                      className="bg-[rgb(90,90,170)] hover:bg-[rgb(110,110,190)] py-1 px-3 rounded text-white"
                      onClick={() => handlePasswordUpdate(user.id)}
                    >
                      Cambiar
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Botón de exportación */}
      <div className="w-full max-w-6xl px-4 flex justify-end mt-4">
        <button
          onClick={handleDownloadExcel}
          className="bg-[rgb(90,90,170)] hover:bg-[rgb(110,110,190)] text-white py-2 px-4 rounded"
        >
          📥 Descargar Excel
        </button>
      </div>

      {/* Paginación */}
      <div className="w-full max-w-6xl px-4 flex flex-wrap justify-center gap-2 mt-4">
        <button
          onClick={() => paginate(currentPage - 1)}
          disabled={currentPage === 1}
          className={`px-4 py-2 rounded-full ${currentPage === 1 ? 'bg-gray-400 cursor-not-allowed' : 'bg-[rgb(90,90,170)] hover:bg-[rgb(110,110,190)]'}`}
        >
          ◀ Anterior
        </button>

        {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
          <button
            key={page}
            onClick={() => paginate(page)}
            className={`px-4 py-2 rounded-full font-bold ${page === currentPage ? 'bg-[rgb(110,110,190)]' : 'bg-[rgb(90,90,170)] hover:bg-[rgb(110,110,190)]'}`}
          >
            {page}
          </button>
        ))}

        <button
          onClick={() => paginate(currentPage + 1)}
          disabled={currentPage === totalPages || totalPages === 0}
          className={`px-4 py-2 rounded-full ${currentPage === totalPages || totalPages === 0 ? 'bg-gray-400 cursor-not-allowed' : 'bg-[rgb(90,90,170)] hover:bg-[rgb(110,110,190)]'}`}
        >
          Siguiente ▶
        </button>
      </div>
    </div>
  );
};

export default UsersManagement;
