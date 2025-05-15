import React, { useState, useEffect } from "react";
import axios from "axios";
import { useSelector } from "react-redux";
import Swal from "sweetalert2";
import * as XLSX from "xlsx";
import "./estilospaneladm.css";

const UsersManagement = () => {
  const [users, setUsers] = useState([]);
  const [allUsers, setAllUsers] = useState([]);
  const [search, setSearch] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [usersPerPage] = useState(2);
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
    <div className="users-management">
      <h2>Gestión de Usuarios</h2>

      <div className="search-bar">
        <input
          type="text"
          placeholder="Buscar por nombre..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      <table className="users-table">
        <thead>
          <tr>
            <th>Nombre</th>
            <th>Email</th>
            <th>Teléfono</th>
            <th>Estado</th>
            <th>Administrador</th>
            <th>Cajero</th>
            <th>Acciones</th>
            <th>Cambiar Contraseña</th>
          </tr>
        </thead>
        <tbody>
          {currentUsers.map((user) => (
            <tr key={user.id}>
              <td>{user.name}</td>
              <td>{user.email}</td>
              <td>{user.phone ? user.phone : "No disponible"}</td>
              <td>{user.disabled ? "Deshabilitado" : "Activo"}</td>
              <td>
                <button
                  className="botonedit"
                  onClick={() => handleRoleChange(user.id, "isAdmin")}
                >
                  {user.isAdmin ? "Quitar Admin" : "Asignar Admin"}
                </button>
              </td>
              <td>
                <button
                  className="botonedit"
                  onClick={() => handleRoleChange(user.id, "cashier")}
                >
                  {user.cashier ? "Quitar Cajero" : "Asignar Cajero"}
                </button>
              </td>
              <td>
                <button
                  className="botonedit"
                  onClick={() => handleDisableToggle(user.id)}
                >
                  {user.disabled ? "Habilitar" : "Deshabilitar"}
                </button>
              </td>
              <td>
                <input
                  type="password"
                  placeholder="Nueva contraseña"
                  value={passwordChanges[user.id] || ""}
                  onChange={(e) =>
                    handlePasswordInputChange(user.id, e.target.value)
                  }
                  className="input-password"
                />
                <button
                  className="botonedit"
                  onClick={() => handlePasswordUpdate(user.id)}
                >
                  Cambiar
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      <button className="export-button" onClick={handleDownloadExcel}>
        📥 Descargar Excel
      </button>

      <div className="pagination">
  <button
    onClick={() => paginate(currentPage - 1)}
    disabled={currentPage === 1}
    className="pagination-button"
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
        className={`paginations-buttons ${page === currentPage ? "actives" : ""}`}
      >
        {page}
      </button>
    );
  })}

  <button
    onClick={() => paginate(currentPage + 1)}
    disabled={currentPage === Math.ceil(users.length / usersPerPage)}
    className="pagination-button"
  >
    Siguiente ▶
  </button>
</div>
    </div>
  );
};

export default UsersManagement;
