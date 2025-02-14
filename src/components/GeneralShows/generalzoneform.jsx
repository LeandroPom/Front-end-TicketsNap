import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate, useParams } from 'react-router-dom';
import { useSelector } from 'react-redux';
import Swal from 'sweetalert2';

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
      zoneName,
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
        confirmButtonText: 'OK'
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
    <form onSubmit={handleSubmit} style={formStyle}>
      <div style={formRowStyle}>
        <div style={{ width: '48%' }}>
          <label>Nombre de la Zona:
            <input type="text" value={zoneName} onChange={(e) => setZoneName(e.target.value)} required />
          </label>
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

      <button type="submit" style={buttonStyle}>Guardar Zona</button>
    </form>
  );
};

const formStyle = {
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  maxWidth: '600px',
  margin: '80px auto 0',
  padding: '20px',
  border: '1px solid #ccc',
  borderRadius: '10px',
  boxShadow: '0px 4px 6px rgba(0, 0, 0, 0.1)',
  backgroundColor: 'white'
};

const formRowStyle = {
  display: 'flex',
  justifyContent: 'space-between',
  width: '100%'
};

const buttonStyle = {
  marginTop: '20px',
  padding: '10px 20px',
  backgroundColor: '#007BFF',
  color: 'white',
  border: 'none',
  borderRadius: '5px',
  cursor: 'pointer'
};

export default GeneralZoneForm;
