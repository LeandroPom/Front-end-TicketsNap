import React, { useState, useEffect } from "react";
import axios from "axios";
import { Bar, Doughnut } from "react-chartjs-2";
import "./estilospaneladm.css";

const Dashboard = () => {
  const [metrics, setMetrics] = useState({
    users: 0,
    shows: 0,
    places: 0,
    seats: 0,
  });
  const [loading, setLoading] = useState(true); // Nuevo estado para verificar si se están cargando las métricas
  const [error, setError] = useState(null); // Estado para manejar el error

  useEffect(() => {
    fetchMetrics();
  }, []);

  const fetchMetrics = async () => {
    try {
      const response = await axios.get("/api/dashboard/metrics");
      setMetrics(response.data);
      setLoading(false); // Setea loading a false cuando las métricas estén cargadas
    } catch (error) {
      console.error("Error fetching metrics:", error);
      setLoading(false); // También se cambia a false si ocurre un error
      setError("Error al cargar las métricas."); // Guardamos el mensaje de error
    }
  };

  const barData = {
    labels: ["Usuarios", "Shows", "Lugares", "Asientos"],
    datasets: [
      {
        label: "Cantidad",
        data: [metrics.users, metrics.shows, metrics.places, metrics.seats],
        backgroundColor: ["#007bff", "#28a745", "#ffc107", "#dc3545"],
      },
    ],
  };

  const doughnutData = {
    labels: ["Usuarios", "Shows", "Lugares", "Asientos"],
    datasets: [
      {
        data: [metrics.users, metrics.shows, metrics.places, metrics.seats],
        backgroundColor: ["#007bff", "#28a745", "#ffc107", "#dc3545"],
      },
    ],
  };

  if (loading) {
    return <div>Loading Metrics..</div>; // Mensaje mientras se cargan los datos
  }

  if (error) {
    return <div>{error}</div>; // Muestra el mensaje de error si hubo un problema
  }

  return (
    <div className="dashboard">
      <h2>Dashboard</h2>

      <div className="metrics-container">
        <div className="metric-card">
          <h3>Users</h3>
          <p>{metrics.users}</p>
        </div>
        <div className="metric-card">
          <h3>Shows</h3>
          <p>{metrics.shows}</p>
        </div>
        <div className="metric-card">
          <h3>Places</h3>
          <p>{metrics.places}</p>
        </div>
        <div className="metric-card">
          <h3>Seats</h3>
          <p>{metrics.seats}</p>
        </div>
      </div>

      <div className="charts-container">
        <div className="chart">
          <h3>Resource Distribution</h3>
          <Bar data={barData} />
        </div>
        <div className="chart">
          <h3>Proportions</h3>
          <Doughnut data={doughnutData} />
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
