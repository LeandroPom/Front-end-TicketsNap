import React, { useState, useEffect } from "react";
import axios from "axios";
import { useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { Bar, Doughnut } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend
} from "chart.js";

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
    blockedUsers: 0,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const user = useSelector((state) => state.user);
  const navigate = useNavigate();

  useEffect(() => {
    fetchMetrics();
  }, []);

  const fetchMetrics = async () => {
    try {
      const response = await axios.get("/analitics/");
      const data = response.data;

      const validTickets = data.tickets?.filter(
        (ticket) => ticket.state === true && ticket.qrToken === true
      );

      const blockedUsers = data.users?.filter(
        (user) => user.disabled === true
      ).length;

      setMetrics({
        users: data.users?.length || 0,
        shows: data.shows?.length || 0,
        tickets: validTickets?.length || 0,
        blockedUsers: blockedUsers || 0,
      });
      setLoading(false);
    } catch (error) {
      console.error("Error fetching metrics:", error);
      setError("Error al cargar las métricas.");
      setLoading(false);
    }
  };

  const barData = {
    labels: ["Usuarios", "Shows", "Tickets", "Usuarios bloqueados"],
    datasets: [
      {
        label: "Cantidad",
        data: [
          metrics.users,
          metrics.shows,
          metrics.tickets,
          metrics.blockedUsers,
        ],
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
          metrics.blockedUsers,
        ],
        backgroundColor: ["#007bff", "#28a745", "#ffc107", "#dc3545"],
      },
    ],
  };

  if (loading) return <div className="text-white p-4">Cargando métricas...</div>;
  if (error) return <div className="text-red-400 p-4">{error}</div>;

    const chartOptions = {
    responsive: true,
    plugins: {
      legend: {
        labels: {
          color: 'white', // color de la leyenda
        },
        title: {
          display: false,
        },
      },
      title: {
        display: false,
        color: 'white',
        font: {
          size: 16,
        },
      },
      tooltip: {
        bodyColor: 'white',
        backgroundColor: 'rgba(0,0,0,0.7)',
        titleColor: 'white',
      },
    },
    scales: {
      x: {
        ticks: {
          color: 'white',  // color etiquetas eje X
        },
        grid: {
          color: 'rgba(255,255,255,0.1)', // color rejilla eje X
        },
      },
      y: {
        ticks: {
          color: 'white', // color etiquetas eje Y
        },
        grid: {
          color: 'rgba(255,255,255,0.1)', // color rejilla eje Y
        },
      },
    },
  };

  return (
<div
  className="
    min-h-screen p-4 md:p-6
    w-full max-w-screen-xl
    mx-auto
    relative
    top-[230px]
    z-10
  "
  style={{
    background: "rgb(18, 51, 95)",
    backdropFilter: "blur(10px)",
    WebkitBackdropFilter: "blur(10px)",
  }}
>
      <h2 className="text-white text-2xl font-bold mb-6">Métricas</h2>

      {/* Tarjetas de métricas */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <div className="bg-white/10 p-4 rounded-lg shadow-md text-white text-center">
          <h3 className="font-semibold">Usuarios Totales</h3>
          <p className="text-3xl font-bold">{metrics.users}</p>
        </div>
        <div className="bg-white/10 p-4 rounded-lg shadow-md text-white text-center">
          <h3 className="font-semibold">Eventos Totales</h3>
          <p className="text-3xl font-bold">{metrics.shows}</p>
        </div>
        <div className="bg-white/10 p-4 rounded-lg shadow-md text-white text-center">
          <h3 className="font-semibold">Tickets Totales</h3>
          <p className="text-3xl font-bold">{metrics.tickets}</p>
        </div>
        <div className="bg-white/10 p-4 rounded-lg shadow-md text-white text-center">
          <h3 className="font-semibold">Usuarios Bloqueados</h3>
          <p className="text-3xl font-bold">{metrics.blockedUsers}</p>
        </div>
      </div>

      {/* Gráficos */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white/10 p-4 rounded-lg shadow-md">
          <h3 className="text-white font-semibold mb-4">Distribución de recursos</h3>
          <Bar data={barData} options={chartOptions} />
        </div>
        <div className="bg-white/10 p-4 rounded-lg shadow-md">
          <h3 className="text-white font-semibold mb-4">Proporciones</h3>
          <Doughnut data={doughnutData} options={chartOptions} />
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
