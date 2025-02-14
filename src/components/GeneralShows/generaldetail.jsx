import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Swal from 'sweetalert2';
import axios from 'axios';

const GeneralDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const showId = Number(id);

  // Estados
  const [show, setShow] = useState(null);
  const [zone, setZone] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedDivision, setSelectedDivision] = useState('');
  const [selectedPrice, setSelectedPrice] = useState(0);
  const [formData, setFormData] = useState({
    name: '',
    dni: '',
    mail: '',
    phone: '',
    userId: 1,
    user: { cashier: true },
  });

  useEffect(() => {
    const fetchShowAndZones = async () => {
      setLoading(true);
      setZone(null);

      try {
        // Obtener shows
        const showsResponse = await axios.get('/shows');
        const foundShow = showsResponse.data.find((s) => s.id === showId);

        if (!foundShow) {
          Swal.fire({ title: 'Error', text: 'No se encontró el show', icon: 'error' }).then(() => navigate('/'));
          return;
        }

        setShow(foundShow);

        // Obtener zonas generales
        const response = await axios.get('/zones/general');
        const generalZones = response.data.generalZones || [];

        // Buscar la zona del show actual
        const filteredZone = generalZones.find((z) => z.showId === showId);

        if (filteredZone) {
          setZone(filteredZone);
          setSelectedDivision(filteredZone.location[0].division);
          setSelectedPrice(filteredZone.location[0].price);
        } else {
          Swal.fire({ title: 'No hay zona para este show', text: 'Debes agregar una zona', icon: 'warning' })
            .then(() => navigate(`/create/general/zone/${showId}`));
        }
      } catch (error) {
        Swal.fire({ title: 'Error al obtener los datos', text: 'Intenta nuevamente', icon: 'error' })
          .then(() => navigate(`/create/general/zone/${showId}`));
      } finally {
        setLoading(false);
      }
    };

    fetchShowAndZones();
  }, [showId, navigate]);

  const handleInputChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleDivisionChange = (e) => {
    const divisionName = e.target.value;
    setSelectedDivision(divisionName);

    const selectedDiv = zone.location.find((loc) => loc.division === divisionName);
    if (selectedDiv) {
      setSelectedPrice(selectedDiv.price);
    }
  };

  const handlePurchase = async () => {
    if (!selectedDivision) {
      Swal.fire({ title: 'Error', text: 'Debe seleccionar una división', icon: 'error' });
      return;
    }

    const ticketData = {
      showId,
      zoneId: zone.id,
      division: selectedDivision,
      price: selectedPrice,
      ...formData,
    };

    try {
      await axios.post('http://localhost:3001/tickets/sell/general', ticketData);
      Swal.fire({ title: 'Compra realizada', text: 'El ticket ha sido generado', icon: 'success', confirmButtonText: 'Aceptar' });
      navigate(`/general/ticket/success?zoneId=${zone.id}&showId=${showId}&ticketInfo=${JSON.stringify(ticketData)}`);
    } catch (error) {
      Swal.fire({ title: 'Error', text: 'No se pudo completar la compra', icon: 'error' });
    }
  };

  if (loading) return <p>Cargando...</p>;
  if (!show) return <p>SIN INFORMACIÓN</p>;

  return (
    <div style={{ padding: '30px', maxWidth: '800px', margin: 'auto', backgroundColor: '#f8f9fa', borderRadius: '10px' }}>
      <h1 style={{ color: '#007bff' }}>{show.name}</h1>
      <img src={show.coverImage} alt={show.name} style={{ width: '100%', borderRadius: '10px', marginBottom: '20px' }} />
      <p><strong>Género:</strong> {show.genre.join(', ')}</p>
      <p><strong>Artistas:</strong> {show.artists.join(', ')}</p>
      <p><strong>Descripción:</strong> {show.description}</p>
      <p><strong>Ubicación:</strong> {show.location}</p>

      {zone && (
        <div style={{ marginTop: '20px', padding: '20px', backgroundColor: '#ffffff', borderRadius: '8px', boxShadow: '0 2px 8px rgba(0,0,0,0.1)' }}>
          <h3 style={{ color: '#343a40' }}>Información de la Zona</h3>
          <p><strong>Fecha Presentación:</strong> {zone.presentation.date}</p>
          <p><strong>Horario:</strong> {zone.presentation.time.start} - {zone.presentation.time.end}</p>

          {zone.location.map((loc, index) => {
            const availableSpace = loc.space - loc.occupied;
            return (
              <p key={index}>
                <strong>{loc.division}:</strong> Capacidad: {loc.space} | Disponible: {availableSpace} | <strong>Precio:</strong> ${loc.price}
              </p>
            );
          })}

          <h3 style={{ marginTop: '20px', color: '#007bff' }}>Comprar Entrada</h3>
          <div style={{ marginBottom: '15px' }}>
            <label style={{ marginRight: '10px' }}>División:</label>
            <select
              value={selectedDivision}
              onChange={handleDivisionChange}
              style={{
                padding: '10px',
                borderRadius: '5px',
                border: '1px solid #ccc',
                fontSize: '16px',
                width: '100%',
                marginTop: '5px',
              }}
            >
              {zone?.location?.map((loc) => (
                <option key={loc.division} value={loc.division}>{loc.division}</option>
              ))}
            </select>
          </div>

          <p><strong>Precio:</strong> ${selectedPrice}</p>

          <div style={{ marginBottom: '15px' }}>
            <label style={{ display: 'block', marginBottom: '5px' }}>Nombre:</label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleInputChange}
              style={{
                padding: '10px',
                borderRadius: '5px',
                border: '1px solid #ccc',
                width: '100%',
                fontSize: '16px',
              }}
            />
          </div>

          <div style={{ marginBottom: '15px' }}>
            <label style={{ display: 'block', marginBottom: '5px' }}>DNI:</label>
            <input
              type="number"
              name="dni"
              value={formData.dni}
              onChange={handleInputChange}
              style={{
                padding: '10px',
                borderRadius: '5px',
                border: '1px solid #ccc',
                width: '100%',
                fontSize: '16px',
              }}
            />
          </div>

          <div style={{ marginBottom: '15px' }}>
            <label style={{ display: 'block', marginBottom: '5px' }}>Email:</label>
            <input
              type="email"
              name="mail"
              value={formData.mail}
              onChange={handleInputChange}
              style={{
                padding: '10px',
                borderRadius: '5px',
                border: '1px solid #ccc',
                width: '100%',
                fontSize: '16px',
              }}
            />
          </div>

          <div style={{ marginBottom: '15px' }}>
            <label style={{ display: 'block', marginBottom: '5px' }}>Teléfono:</label>
            <input
              type="number"
              name="phone"
              value={formData.phone}
              onChange={handleInputChange}
              style={{
                padding: '10px',
                borderRadius: '5px',
                border: '1px solid #ccc',
                width: '100%',
                fontSize: '16px',
              }}
            />
          </div>

          <button
            onClick={handlePurchase}
            style={{
              padding: '12px 20px',
              backgroundColor: '#28a745',
              color: 'white',
              border: 'none',
              borderRadius: '5px',
              cursor: 'pointer',
              fontSize: '16px',
              width: '100%',
            }}
          >
            Comprar
          </button>
        </div>
      )}
    </div>
  );
};

export default GeneralDetail;
