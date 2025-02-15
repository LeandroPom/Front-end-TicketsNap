import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Swal from 'sweetalert2';
import axios from 'axios';
import { useSelector } from 'react-redux';
import '../Home/home.css';

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
  const user = useSelector((state) => state.user);

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

  const handleDivisionChange = (e) => {
    const divisionName = e.target.value;
    setSelectedDivision(divisionName);

    const selectedDiv = zone.location.find((loc) => loc.division === divisionName);
    if (selectedDiv) {
      setSelectedPrice(selectedDiv.price);
    }
  };

  const handleOpenBuyerModal = (paymentMethod) => {
    Swal.fire({
      title: 'Debe cargar los datos del comprador',
      html: `
        <div>
          <label>DNI:</label><br/>
          <input type="text" id="dni" class="swal2-input" placeholder="Ingrese el DNI"/>
          <label>Nombre:</label><br/>
          <input type="text" id="firstName" class="swal2-input" placeholder="Ingrese el nombre"/>
          <label>Apellido:</label><br/>
          <input type="text" id="lastName" class="swal2-input" placeholder="Ingrese el apellido"/>
          <label>Correo:</label><br/>
          <input type="email" id="email" class="swal2-input" placeholder="Ingrese el correo"/>
          <label>Teléfono:</label><br/>
          <input type="text" id="phone" class="swal2-input" placeholder="Ingrese el teléfono"/>
        </div>
      `,
      focusConfirm: false,
      preConfirm: () => {
        const dni = document.getElementById('dni').value;
        const firstName = document.getElementById('firstName').value;
        const lastName = document.getElementById('lastName').value;
        const email = document.getElementById('email').value;
        const phone = document.getElementById('phone').value;

        if (!dni || !firstName || !lastName || !email || !phone) {
          Swal.showValidationMessage('Todos los campos son obligatorios');
          return null;
        }
        return { dni, firstName, lastName, email, phone };
      },
    }).then((result) => {
      if (result.isConfirmed) {
        handleConfirmPurchase(result.value, paymentMethod);
      }
    });
  };

  const handleConfirmPurchase = async (buyerDetails, paymentMethod) => {
    const ticketData = {
      showId,
      zoneId: zone.id,
      division: selectedDivision,
      price: selectedPrice,
      userId: user?.id,
      user: {
        "cashier": user?.cashier
      },
      name: `${buyerDetails.firstName} ${buyerDetails.lastName}`,
      dni: buyerDetails.dni,
      mail: buyerDetails.email,
      phone: buyerDetails.phone,
    };

    try {
      if (paymentMethod === "sell") {
        const response = await axios.post('/tickets/sell/general', ticketData);
        Swal.fire({
          title: 'Compra finalizada con éxito',
          text: 'Tu ticket ha sido generado correctamente.',
          icon: 'success',
          confirmButtonText: 'Aceptar',
        }).then(() => {
          navigate('/success', { state: response.data });
        });
      } else if (paymentMethod === "buy") {
        const response = await axios.post('/tickets/buy/general', ticketData);
        window.location.href = response.data.init_point;
      }
    } catch (error) {
      Swal.fire({
        title: 'Error',
        text: 'No se pudo completar la venta. Intenta nuevamente.',
        icon: 'error',
        confirmButtonText: 'Aceptar',
      });
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

          <button
  onClick={() => handleOpenBuyerModal(user?.cashier ? "sell" : "buy")}
  className="buttonhome"
  style={{
    width: '50%', // Asegúrate de que el botón ocupe todo el ancho si así lo prefieres
    padding: '12px 10px', // Ajuste adicional de padding si lo necesitas
    cursor: 'pointer',
    marginLeft: '180px',  // Esto empuja el botón hacia la derecha
    marginRight: '0',    // Elimina cualquier margen a la derecha (si es necesario)
  }}
>
  {user?.cashier ? "Vender Entrada" : "Comprar con Mercado Pago"}
</button>
        </div>
      )}
    </div>
  );
};

export default GeneralDetail;
