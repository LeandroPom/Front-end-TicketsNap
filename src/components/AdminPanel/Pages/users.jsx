import React, { useState, useEffect } from "react";
import axios from "axios";
import { useSelector } from "react-redux";
import Swal from "sweetalert2";
import "./estilospaneladm.css";

const UsersManagement = () => {
  const [users, setUsers] = useState([]); // Lista filtrada
  const [allUsers, setAllUsers] = useState([]); // Lista original sin filtrar
  const [search, setSearch] = useState("");
  const [currentPage, setCurrentPage] = useState(1); // Página actual
  const [usersPerPage] = useState(2); // Número de usuarios por página

  const user = useSelector((state) => state.user);

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      const response = await axios.get(`/users`);
      setUsers(response.data);
      setAllUsers(response.data); // Guarda una copia de todos los usuarios
    } catch (error) {
      console.error("Error fetching users:", error);
    }
  };

  // Filtrar usuarios en tiempo real cuando cambia el valor de search
  useEffect(() => {
    const filteredUsers = allUsers.filter((u) =>
      u.name.toLowerCase().includes(search.toLowerCase())
    );
    setUsers(filteredUsers);
  }, [search, allUsers]);

  // Determina los usuarios que se deben mostrar en la página actual
  const indexOfLastUser = currentPage * usersPerPage;
  const indexOfFirstUser = indexOfLastUser - usersPerPage;
  const currentUsers = users.slice(indexOfFirstUser, indexOfLastUser);

  // Cambiar la página actual
  const paginate = (pageNumber) => setCurrentPage(pageNumber);

  // Cálculo de las páginas
  const pageNumbers = [];
  for (let i = 1; i <= Math.ceil(users.length / usersPerPage); i++) {
    pageNumbers.push(i);
  }

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
          {currentUsers.map((user) => (
            <tr key={user.id}>
              <td>{user.name}</td>
              <td>{user.email}</td>
              <td>{user.disabled ? "Deshabilitado" : "Activo"}</td>
              <td>
                <button className="botonedit">
                  {user.isAdmin ? "Quitar Admin" : "Asignar Admin"}
                </button>
              </td>
              <td>
                <button className="botonedit">
                  {user.cashier ? "Quitar Cajero" : "Asignar Cajero"}
                </button>
              </td>
              <td>
                <button className="botonedit">
                  {user.disabled ? "Habilitar" : "Deshabilitar"}
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* Paginación */}
      <div className="pagination">
        <button
          onClick={() => paginate(currentPage - 1)}
          disabled={currentPage === 1}
          className="pagination-button"
        >
          ◀ Anterior
        </button>

        {pageNumbers.map((number) => (
          <button
            key={number}
            onClick={() => paginate(number)}
            className={`pagination-button ${number === currentPage ? "active" : ""}`}
          >
            {number}
          </button>
        ))}

        <button
          onClick={() => paginate(currentPage + 1)}
          disabled={currentPage === pageNumbers.length}
          className="pagination-button"
        >
          Siguiente ▶
        </button>
      </div>
    </div>
  );
};

export default UsersManagement;
