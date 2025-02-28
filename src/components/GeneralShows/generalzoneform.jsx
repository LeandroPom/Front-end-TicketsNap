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
      await axios.post('http://localhost:3001/zones/add/general', data);
      Swal.fire({
        title: 'Zona creada con éxito',
        icon: 'success',
        confirmButtonText: 'OK',
        customClass: {
          popup: 'custom-popup-success',  // Clase personalizada para el popup de éxito
        }
      }).then(() => navigate('/'));
    } catch (error) {
      Swal.fire({
        title: 'Error al crear la zona',
        text: error.response?.data?.message || error.message,
        icon: 'error'
      });
    }
  };

  return (
    <form  className="form-containers" onSubmit={handleSubmit}>
      <div className="form-row">
        <div style={{ width: '48%' }}>
          {/* <label>Nombre de la Zona:
            <input type="text" value={zoneName} onChange={(e) => setZoneName(e.target.value)} required />
          </label> */}
          <label>Fecha de Presentación:
            <input type="date" value={date} onChange={(e) => setDate(e.target.value)} required />
          </label>
          <label>Performance:
            <input type="number" value={performance} onChange={(e) => setPerformance(e.target.value)} required />
          </label>
        </div>
        <div style={{ width: '48%' }}>
          <label>Hora de Inicio:
            <input type="time" value={startTime} onChange={(e) => setStartTime(e.target.value)} required />
          </label>
          <label>Hora de Fin:
            <input type="time" value={endTime} onChange={(e) => setEndTime(e.target.value)} required />
          </label>
        </div>
      </div>

      <h3>Zona General</h3>
      <label>Precio General:
        <input type="number" value={priceGeneral} onChange={(e) => setPriceGeneral(e.target.value)} required />
      </label>
      <label>Capacidad General:
        <input type="number" value={spaceGeneral} onChange={(e) => setSpaceGeneral(e.target.value)} required />
      </label>

      <h3>Zona VIP</h3>
      <label>
        <input type="checkbox" checked={hasVip} onChange={(e) => setHasVip(e.target.checked)} />
        ¿Incluir zona VIP?
      </label>

      {hasVip && (
        <>
          <label>Precio VIP:
            <input type="number" value={priceVip} onChange={(e) => setPriceVip(e.target.value)} required />
          </label>
          <label>Capacidad VIP:
            <input type="number" value={spaceVip} onChange={(e) => setSpaceVip(e.target.value)} required />
          </label>
        </>
      )}

      <button type="submit" className="custom-button">Guardar Zona</button>
    </form>
  );
};

export default GeneralZoneForm;
