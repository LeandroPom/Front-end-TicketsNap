import React, { useState, useEffect } from "react";
import axios from "axios";
import { useSelector } from "react-redux";
import Swal from "sweetalert2";
import { useNavigate } from "react-router-dom";
import { Bar, Doughnut } from "react-chartjs-2";
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, ArcElement, Title, Tooltip, Legend } from 'chart.js';
import "./estilospaneladm.css";

// Registra los componentes necesarios de Chart.js
ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend
);

const Dashboard = () => {
  const [metrics, setMetrics] = useState({
    users: 0,
    shows: 0,
    tickets: 0,
    blockedUsers: 0, // Para el conteo de usuarios bloqueados
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const user = useSelector((state) => state.user);
  const navigate = useNavigate();

  // Cargar métricas sin verificar si es admin
  useEffect(() => {
    fetchMetrics(); // Traemos las métricas sin importar si el usuario es admin o no
  }, []); // Se ejecuta una sola vez al montar el componente

  const fetchMetrics = async () => {
    try {
      const response = await axios.get("/analitics/");
      const data = response.data;

      console.log(response.data, " datos de los tickets");

      // Filtrar solo los tickets con "state": true y "qrToken": true
      const validTickets = data.tickets?.filter(ticket => ticket.state === true && ticket.qrToken === true);

      // Contar los usuarios bloqueados
      const blockedUsers = data.users?.filter(user => user.disabled === true).length;

      setMetrics({
        users: data.users?.length,
        shows: data.shows?.length,
        tickets: validTickets.length, // Solo los tickets válidos
        blockedUsers: blockedUsers,  // Contar los usuarios bloqueados
      });
      setLoading(false);
    } catch (error) {
      console.error("Error fetching metrics:", error);
      setLoading(false);
      setError("Error al cargar las métricas.");
    }
  };

  const barData = {
    labels: ["Usuarios", "Shows", "Tickets", "Usuarios bloqueados"],
    datasets: [
      {
        label: "Cantidad",
        data: [metrics.users, metrics.shows, metrics.tickets, metrics.blockedUsers], // Cambié el total del mes por usuarios bloqueados
        backgroundColor: ["#007bff", "#28a745", "#ffc107", "#dc3545"],
      },
    ],
  };

  const doughnutData = {
    labels: ["Usuarios", "Shows", "Tickets", "Usuarios bloqueados"],
    datasets: [
      {
        data: [
          metrics.users,
          metrics.shows,
          metrics.tickets,
          metrics.blockedUsers,  // Agregué usuarios bloqueados
        ],
        backgroundColor: [
          "#007bff",  // Azul para usuarios
          "#28a745",  // Verde para shows
          "#ffc107",  // Amarillo para tickets
          "#dc3545",  // Rojo para usuarios bloqueados
        ],
      },
    ],
  };

  if (loading) {
    return <div>Loading Metrics...</div>;
  }

  if (error) {
    return <div>{error}</div>;
  }

  return (
    <div className="dashboard">
      <h2>Metricas</h2>

      <div className="metrics-container">
        <div className="metric-card">
          <h3>Usuarios Totales</h3>
          <p>{metrics.users}</p>
        </div>
        <div className="metric-card">
          <h3>Eventos Totales</h3>
          <p>{metrics.shows}</p>
        </div>
        <div className="metric-card">
          <h3>Tickets Totales</h3>
          <p>{metrics.tickets}</p>
        </div>
        <div className="metric-card">
          <h3>Usuarios Bloqueados</h3>
          <p>{metrics.blockedUsers}</p> {/* Muestra la cantidad de usuarios bloqueados */}
        </div>
      </div>

      <div className="charts-container">
        <div className="chart">
          <h3>Distribución de recursos</h3>
          <Bar data={barData} />
        </div>
        <div className="chart">
          <h3>Proporciones</h3>
          <Doughnut data={doughnutData} />
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
