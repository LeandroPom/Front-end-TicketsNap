import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate, useParams } from 'react-router-dom';
import { useSelector } from 'react-redux';
import Swal from 'sweetalert2';
import './generalzone.css';  // Asegúrate de importar el archivo CSS

const GeneralZoneForm = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const showId = Number(id);

  const shows = useSelector((state) => state.shows);
  const show = shows.find((s) => s.id === showId);

  const [zoneName, setZoneName] = useState('');
  const [date, setDate] = useState('');
  const [performance, setPerformance] = useState('');
  const [startTime, setStartTime] = useState('');
  const [endTime, setEndTime] = useState('');
  const [priceGeneral, setPriceGeneral] = useState('');
  const [spaceGeneral, setSpaceGeneral] = useState('');
  const [hasVip, setHasVip] = useState(false);
  const [priceVip, setPriceVip] = useState('');
  const [spaceVip, setSpaceVip] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!show) {
      Swal.fire({
        title: 'Error',
        text: 'No se encontró el show',
        icon: 'error'
      });
      return;
    }

    const locationData = [
      {
        division: "General",
        price: Number(priceGeneral),
        space: Number(spaceGeneral)
      }
    ];

    if (hasVip) {
      locationData.push({
        division: "Vip",
        price: Number(priceVip),
        space: Number(spaceVip),
        hasVip: true
      });
    }

    const data = {
      showId,
      zoneName: "FlorestaGeneral",
      updates: {
        presentation: {
          date,
          performance: Number(performance),
          time: { start: startTime, end: endTime }
        },
        location: locationData
      }
    };

    console.log(data, "Data enviada al backend");

    try {
      await axios.post('/zones/add/general', data);
      Swal.fire({
        title: 'Zona creada con éxito',
        icon: 'success',
        confirmButtonText: 'OK',
        customClass: {
          popup: 'custom-popup-success',  // Clase personalizada para el popup de éxito
        }
      }).then();
    } catch (error) {
      Swal.fire({
        title: 'Error al crear la zona',
        text: error.response?.data?.message || error.message,
        icon: 'error'
      });
    }
  };

return (
  <div className="mt-[90px] min-h-screen flex items-center justify-center p-4 bg-gradient-to-b from-[rgba(86,86,190,0.4)] to-[rgba(86,86,190,0.4)] backdrop-blur-md">
    <div className="w-full max-w-2xl bg-[rgba(86,86,190,0.4)] backdrop-blur-md rounded-lg p-6 shadow-lg">
      <form className="flex flex-col gap-6" onSubmit={handleSubmit}>

        {/* Título */}
        <h2 className="text-2xl md:text-3xl font-bold text-center text-white">Editar/Zonas</h2>

        {/* Primera fila: Fecha y Presentación / Hora Inicio y Hora Fin */}
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex flex-col w-full md:w-1/2 gap-3">
            <label className="text-white font-semibold">Fecha de Presentación:
              <input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                required
                className="form-input p-2 rounded bg-[rgba(70,70,140,0.7)] border border-white text-white focus:outline-none focus:ring-2 focus:ring-blue-400 w-full"
              />
            </label>
            <label className="text-white font-semibold">Presentación:
              <input
                type="number"
                value={performance}
                onChange={(e) => setPerformance(e.target.value)}
                required
                className="form-input p-2 rounded bg-[rgba(70,70,140,0.7)] border border-white text-white focus:outline-none focus:ring-2 focus:ring-blue-400 w-full"
              />
            </label>
          </div>
          <div className="flex flex-col w-full md:w-1/2 gap-3">
            <label className="text-white font-semibold">Hora de Inicio:
              <input
                type="time"
                value={startTime}
                onChange={(e) => setStartTime(e.target.value)}
                required
                className="form-input p-2 rounded bg-[rgba(70,70,140,0.7)] border border-white text-white focus:outline-none focus:ring-2 focus:ring-blue-400 w-full"
              />
            </label>
            <label className="text-white font-semibold">Hora de Fin:
              <input
                type="time"
                value={endTime}
                onChange={(e) => setEndTime(e.target.value)}
                required
                className="form-input p-2 rounded bg-[rgba(70,70,140,0.7)] border border-white text-white focus:outline-none focus:ring-2 focus:ring-blue-400 w-full"
              />
            </label>
          </div>
        </div>

        {/* Zona General */}
        <h3 className="text-xl font-semibold text-white">Zona General</h3>
        <label className="text-white font-semibold">Precio General:
          <input
            type="number"
            value={priceGeneral}
            onChange={(e) => setPriceGeneral(e.target.value)}
            required
            className="form-input p-2 rounded bg-[rgba(70,70,140,0.7)] border border-white text-white focus:outline-none focus:ring-2 focus:ring-blue-400 w-full"
          />
        </label>
        <label className="text-white font-semibold">Capacidad General:
          <input
            type="number"
            value={spaceGeneral}
            onChange={(e) => setSpaceGeneral(e.target.value)}
            required
            className="form-input p-2 rounded bg-[rgba(70,70,140,0.7)] border border-white text-white focus:outline-none focus:ring-2 focus:ring-blue-400 w-full"
          />
        </label>

        {/* Zona VIP */}
        <h3 className="text-xl font-semibold text-white">Zona VIP</h3>
        <label className="text-white font-semibold flex items-center gap-2">
          <input type="checkbox" checked={hasVip} onChange={(e) => setHasVip(e.target.checked)} className="w-4 h-4" />
          ¿Incluir zona VIP?
        </label>

        {hasVip && (
          <>
            <label className="text-white font-semibold">Precio VIP:
              <input
                type="number"
                value={priceVip}
                onChange={(e) => setPriceVip(e.target.value)}
                required
                className="form-input p-2 rounded bg-[rgba(70,70,140,0.7)] border border-white text-white focus:outline-none focus:ring-2 focus:ring-blue-400 w-full"
              />
            </label>
            <label className="text-white font-semibold">Capacidad VIP:
              <input
                type="number"
                value={spaceVip}
                onChange={(e) => setSpaceVip(e.target.value)}
                required
                className="form-input p-2 rounded bg-[rgba(70,70,140,0.7)] border border-white text-white focus:outline-none focus:ring-2 focus:ring-blue-400 w-full"
              />
            </label>
          </>
        )}

        {/* Botones */}
        <div className="flex flex-col md:flex-row gap-4 mt-4">
          <button type="submit" className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded transition-colors w-full md:w-auto">
            Guardar Zona
          </button>
          <button
            type="button"
            onClick={() => navigate('/')}
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded transition-colors w-full md:w-auto"
          >
            Cerrar
          </button>
        </div>

      </form>
    </div>
  </div>
);

};

export default GeneralZoneForm;
