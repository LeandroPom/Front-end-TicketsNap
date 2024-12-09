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
      const response = await axios.get(`http://localhost:3001/users`);
      setUsers(response.data);
    } catch (error) {
      console.error("Error fetching users:", error);
    }
  };

  const handleToggleDisabled = async (id, currentDisabled) => {
    // Verificamos si el usuario logueado es admin
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
      await axios.put(`http://localhost:3001/users/edit`, {
        id, // Enviar el ID como identificador
        updates: { disabled: !currentDisabled },
        user: user // Aseguramos que se envía la información del usuario logueado
      });
      fetchUsers(); // Actualiza la lista de usuarios después del cambio
    } catch (error) {
      console.error("Error toggling disabled status:", error.response?.data || error.message);
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
            <th>Rol</th>
            <th>Estado</th>
            <th>Acciones</th>
          </tr>
        </thead>
        <tbody>
          {users.map((user) => (
            <tr key={user.id}>
              <td>{user.name}</td>
              <td>{user.email}</td>
              <td>{user.role}</td>
              <td>{user.disabled ? "Deshabilitado" : "Activo"}</td>
              <td>
                <button
                  onClick={() => handleToggleDisabled(user.id, user.disabled)}
                >
                  {user.disabled ? "Habilitar" : "Deshabilitar"}
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
