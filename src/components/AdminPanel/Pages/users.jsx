import React, { useState, useEffect } from "react";
import axios from "axios";
import { useSelector } from "react-redux"; // Importamos useSelector para acceder al estado de Redux
import Swal from "sweetalert2";
import "./estilospaneladm.css";

const UsersManagement = () => {
  const [users, setUsers] = useState([]);
  const [search, setSearch] = useState("");

  // Accedemos al usuario desde el estado global para verificar si es admin
  const user = useSelector((state) => state.user); // Cambié `state.user` a `state.user.user`

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      const response = await axios.get(`/users`);
      setUsers(response.data);
    } catch (error) {
      console.error("Error fetching users:", error);
    }
  };

  const handleToggleDisabled = async (id, currentDisabled) => {
    console.log("Usuario en Redux:", user);

    // Verifica si el usuario logueado es admin
    if (!user?.isAdmin) {
      Swal.fire({
        icon: "error",
        title: "Acción no permitida",
        text: "Solo los administradores pueden realizar esta acción.",
      });
      return; // Detenemos la ejecución si no es admin
    }

    try {
      // Cambia la propiedad `disabled` al valor opuesto
      const response = await axios.put(`/users/edit`, {
        id,
        updates: { disabled: !currentDisabled },
        user, // Envía el usuario logueado para validaciones
      });

      console.log("Respuesta del backend:", response.data);
      fetchUsers(); // Actualiza la lista de usuarios después del cambio
    } catch (error) {
      console.error(
        "Error toggling disabled status:",
        error.response?.data || error.message
      );
      Swal.fire({
        icon: "error",
        title: "Error",
        text: error.response?.data?.error || "Error al realizar la acción.",
      });
    }
  };

  const handleToggleAdmin = async (id, currentIsAdmin) => {
    if (!user?.isAdmin) {
      Swal.fire({
        icon: "error",
        title: "Acción no permitida",
        text: "Solo los administradores pueden realizar esta acción.",
      });
      return; // Detenemos la ejecución si no es admin
    }

    try {
      const response = await axios.put(`/users/edit`, {
        id,
        updates: { isAdmin: !currentIsAdmin },
        user, // Envía el usuario logueado para validaciones
      });

      console.log("Respuesta del backend:", response.data);
      fetchUsers(); // Actualiza la lista de usuarios después del cambio
    } catch (error) {
      console.error(
        "Error toggling admin status:",
        error.response?.data || error.message
      );
      Swal.fire({
        icon: "error",
        title: "Error",
        text: error.response?.data?.error || "Error al realizar la acción.",
      });
    }
  };

  const handleToggleCashier = async (id, currentCashier) => {
    if (!user?.isAdmin) {
      Swal.fire({
        icon: "error",
        title: "Acción no permitida",
        text: "Solo los administradores pueden realizar esta acción.",
      });
      return; // Detenemos la ejecución si no es admin
    }

    try {
      const response = await axios.put(`/users/edit`, {
        id,
        updates: { cashier: !currentCashier },
        user, // Envía el usuario logueado para validaciones
      });

      console.log("Respuesta del backend:", response.data);
      fetchUsers(); // Actualiza la lista de usuarios después del cambio
    } catch (error) {
      console.error(
        "Error toggling cashier status:",
        error.response?.data || error.message
      );
      Swal.fire({
        icon: "error",
        title: "Error",
        text: error.response?.data?.error || "Error al realizar la acción.",
      });
    }
  };

  return (
    <div className="users-management">
      <h2>Gestión de Usuarios</h2>

      {/* Search Bar */}
      <div className="search-bar">
        <input
          type="text"
          placeholder="Buscar por nombre..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      {/* Users Table */}
      <table className="users-table">
        <thead>
          <tr>
            <th>Nombre</th>
            <th>Email</th>
            <th>Estado</th>
            <th>Administrador</th>
            <th>Cajero</th>
            <th>Acciones</th>
          </tr>
        </thead>
        <tbody>
          {users?.data?.map((user) => (
            <tr key={user?.id}>
              <td>{user?.name}</td>
              <td>{user?.email}</td>

              <td>{user?.disabled ? "Deshabilitado" : "Activo"}</td>
              <td>
                <button
                  className="botonedit"
                  onClick={() => handleToggleAdmin(user.id, user.isAdmin)}
                >
                  {user?.isAdmin ? "Quitar Admin" : "Asignar Admin"}
                </button>
              </td>
              <td>
                <button
                  className="botonedit"
                  onClick={() => handleToggleCashier(user.id, user.cashier)}
                >
                  {user?.cashier ? "Quitar Cajero" : "Asignar Cajero"}
                </button>
              </td>
              <td>
                <button
                  className="botonedit"
                  onClick={() => handleToggleDisabled(user.id, user.disabled)}
                >
                  {user?.disabled ? "Habilitar" : "Deshabilitar"}
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default UsersManagement;
