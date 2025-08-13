import React, { useState, useEffect } from "react";
import axios from "axios";
import { useSelector } from "react-redux";
import Swal from "sweetalert2";
import * as XLSX from "xlsx";
// import "./estilospaneladm.css";

const UsersManagement = () => {
  const [users, setUsers] = useState([]);
  const [allUsers, setAllUsers] = useState([]);
  const [search, setSearch] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [usersPerPage] = useState(5);
  const [passwordChanges, setPasswordChanges] = useState({});

  const user = useSelector((state) => state.user);

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      const response = await axios.get(`/users`);
      setUsers(response.data);
      setAllUsers(response.data);
    } catch (error) {
      console.error("Error fetching users:", error);
    }
  };

  const updateUser = async (id, updates) => {
    if (user?.isAdmin) {
      try {
        await axios.put(`/users/edit`, {
          id,
          updates,
          user: { isAdmin: user.isAdmin },
        });
        fetchUsers();
        Swal.fire({
          icon: "success",
          title: "Actualización exitosa",
          text: `El usuario ha sido actualizado correctamente.`,
          customClass: {
            popup: "custom-popup-success",
          },
        });
      } catch (error) {
        console.error("Error al actualizar el usuario:", error);
        Swal.fire({
          icon: "error",
          title: "Error",
          text: "No se pudo actualizar el usuario.",
          customClass: {
            popup: "custom-popup-success",
          },
        });
      }
    } else {
      Swal.fire({
        icon: "error",
        title: "Permiso Denegado",
        text: "Solo los administradores pueden realizar esta acción.",
        customClass: {
          popup: "custom-popup-success",
        },
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

  useEffect(() => {
    const filteredUsers = allUsers.filter((u) =>
      u.name.toLowerCase().includes(search.toLowerCase())
    );
    setUsers(filteredUsers);
  }, [search, allUsers]);

  const indexOfLastUser = currentPage * usersPerPage;
  const indexOfFirstUser = indexOfLastUser - usersPerPage;
  const currentUsers = users.slice(indexOfFirstUser, indexOfLastUser);

  const paginate = (pageNumber) => setCurrentPage(pageNumber);

  const pageNumbers = [];
  for (let i = 1; i <= Math.ceil(users.length / usersPerPage); i++) {
    pageNumbers.push(i);
  }

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
    <h2 className="text-3xl font-bold mb-6 text-center w-full max-w-6xl px-4 text-white">
      Gestión de Usuarios
    </h2>

    {/* Barra de búsqueda */}
    <div className="w-full max-w-6xl px-4">
      <input
        type="text"
        placeholder="Buscar por nombre..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        className="w-full sm:w-1/2 p-2 rounded bg-[rgb(90,90,170)] text-white border border-white"
      />
    </div>

    {/* Tabla */}
    <div className="w-full max-w-6xl px-4 mt-5 overflow-x-auto bg-[rgb(50,50,109)] rounded-lg shadow-md p-6">
      <table className="min-w-full text-left border border-white text-sm sm:text-base">
        <thead className="bg-[rgb(70,70,140)]">
          <tr>
            {/* Aquí van los th igual */}
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
          {currentUsers.map((user) => (
            <tr key={user.id} className="hover:bg-[rgb(60,60,120)] transition">
              {/* Aquí las td igual */}
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
    <div className="w-full max-w-6xl px-4 flex justify-end">
      <button
        onClick={handleDownloadExcel}
        className="bg-[rgb(90,90,170)] hover:bg-[rgb(110,110,190)] text-white py-2 px-4 rounded"
      >
        📥 Descargar Excel
      </button>
    </div>

    {/* Paginación */}
    <div className="w-full max-w-6xl px-4 flex flex-wrap justify-center gap-2">
      <button
        onClick={() => paginate(currentPage - 1)}
        disabled={currentPage === 1}
        className={`px-4 py-2 rounded-full ${
          currentPage === 1 ? 'bg-gray-400 cursor-not-allowed' : 'bg-[rgb(90,90,170)] hover:bg-[rgb(110,110,190)]'
        }`}
      >
        ◀ Anterior
      </button>

      {Array.from({ length: 4 }, (_, i) => {
        const page = currentPage <= 2 ? i + 1 : currentPage + i - 1;
        if (page > Math.ceil(users.length / usersPerPage)) return null;
        return (
          <button
            key={page}
            onClick={() => paginate(page)}
            className={`px-4 py-2 rounded-full font-bold ${
              page === currentPage
                ? 'bg-[rgb(110,110,190)]'
                : 'bg-[rgb(90,90,170)] hover:bg-[rgb(110,110,190)]'
            }`}
          >
            {page}
          </button>
        );
      })}

      <button
        onClick={() => paginate(currentPage + 1)}
        disabled={currentPage === Math.ceil(users.length / usersPerPage)}
        className={`px-4 py-2 rounded-full ${
          currentPage === Math.ceil(users.length / usersPerPage)
            ? 'bg-gray-400 cursor-not-allowed'
            : 'bg-[rgb(90,90,170)] hover:bg-[rgb(110,110,190)]'
        }`}
      >
        Siguiente ▶
      </button>
    </div>
  </div>
);


};

export default UsersManagement;
