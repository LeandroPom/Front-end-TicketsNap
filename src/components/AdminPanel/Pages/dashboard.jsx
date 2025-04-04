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
    seats: 0,
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

      console.log(response.data, " datos de los tickets")
      setMetrics({
        users: data.users?.length,
        shows: data.shows?.length,
        tickets: data.tickets?.length,
        seats: data.seats?.reduce((acc, seat) => acc + seat, 0), // Sumar los asientos si es necesario
      });
      setLoading(false);
    } catch (error) {
      console.error("Error fetching metrics:", error);
      setLoading(false);
      setError("Error al cargar las métricas.");
    }
  };

  const barData = {
    labels: ["Usuarios", "Shows", "Tickets", "Asientos"],
    datasets: [
      {
        label: "Cantidad",
        data: [metrics.users, metrics.shows, metrics.tickets, metrics.seats],
        backgroundColor: ["#007bff", "#28a745", "#ffc107", "#dc3545"],
      },
    ],
  };

  const doughnutData = {
    labels: ["Usuarios", "Shows", "Tickets", "Asientos"],
    datasets: [
      {
        data: [metrics.users, metrics.shows, metrics.tickets, metrics.seats],
        backgroundColor: ["#007bff", "#28a745", "#ffc107", "#dc3545"],
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
          <h3>Usuarios</h3>
          <p>{metrics.users}</p>
        </div>
        <div className="metric-card">
          <h3>Eventos</h3>
          <p>{metrics.shows}</p>
        </div>
        <div className="metric-card">
          <h3>Tickets</h3>
          <p>{metrics.tickets}</p>
        </div>
        <div className="metric-card">
          <h3>Asientos</h3>
          <p>{metrics.seats}</p>
        </div>
      </div>

      <div className="charts-container">
        <div className="chart">
          <h3>Distribucion de recursos</h3>
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
