import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Swal from 'sweetalert2';
import axios from 'axios';
import { useSelector } from 'react-redux';
import './generaldetail.css'

const GeneralDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const showId = Number(id);

  // Estados
  const [show, setShow] = useState(null);
  const [zone, setZone] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isLoading, setIsLoading] = useState(false);  // Nuevo estado para cargar
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
        <div style="padding: 24px; max-width: 400px; margin: auto; background-color: #FFE57F; border-radius: 10px; font-family: 'Inter', sans-serif;">
          <label style="display: block; font-weight: bold; color: black; margin-bottom: 8px;">DNI:</label>
          <input type="text" id="dni" placeholder="Ingrese el DNI" 
            style="width: 100%; padding: 10px; margin-bottom: 16px; border: 1px solid #FFB74D; border-radius: 5px; font-size: 16px;"/>

          <label style="display: block; font-weight: bold; color: black; margin-bottom: 8px;">Nombre:</label>
          <input type="text" id="firstName" placeholder="Ingrese el nombre" 
            style="width: 100%; padding: 10px; margin-bottom: 16px; border: 1px solid #FFB74D; border-radius: 5px; font-size: 16px;"/>

          <label style="display: block; font-weight: bold; color: black; margin-bottom: 8px;">Apellido:</label>
          <input type="text" id="lastName" placeholder="Ingrese el apellido" 
            style="width: 100%; padding: 10px; margin-bottom: 16px; border: 1px solid #FFB74D; border-radius: 5px; font-size: 16px;"/>

          <label style="display: block; font-weight: bold; color: black; margin-bottom: 8px;">Correo:</label>
          <input type="email" id="email" placeholder="Ingrese el correo" 
            style="width: 100%; padding: 10px; margin-bottom: 16px; border: 1px solid #FFB74D; border-radius: 5px; font-size: 16px;"/>

          <label style="display: block; font-weight: bold; color: black; margin-bottom: 8px;">Teléfono:</label>
          <input type="text" id="phone" placeholder="Ingrese el teléfono" 
            style="width: 100%; padding: 10px; border: 1px solid #FFB74D; border-radius: 5px; font-size: 16px;"/>
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
    setIsLoading(true);  // Activar el loading cuando comience la compra/venta
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
    setIsLoading(false);  // Desactivar el loading cuando finalice la compra/venta
  };

  
  if (!show) return <p>SIN INFORMACIÓN</p>;

  if (isLoading) {
    return (
      <div className="loading-overlay">
        <div className="corner-img top-left" style={{ backgroundImage: 'url(/images/solticket.png)' }}></div>
        <div className="corner-img top-right" style={{ backgroundImage: 'url(/images/solticket.png)' }}></div>
        <div className="corner-img bottom-left" style={{ backgroundImage: 'url(/images/solticket.png)' }}></div>
        <div className="corner-img bottom-right" style={{ backgroundImage: 'url(/images/solticket.png)' }}></div>
  
        <div className="spinner"></div>
        <p>Procesando su compra...</p>
      </div>
    );
  }

  return (
    <div className="show-container">
      <h1 className="show-title">{show.name}</h1>
      <img src={show.coverImage} alt={show.name} className="show-image" />
      <p><strong>Género:</strong> {show.genre.join(', ')}</p>
      <p><strong>Artistas:</strong> {show.artists.join(', ')}</p>
      <p><strong>Descripción:</strong> {show.description}</p>
      <p><strong>Ubicación:</strong> {show.location}</p>
      
      {zone && (
        <div className="zone-info">
          <h3 className="zone-title">Información de la Zona</h3>
          <p><strong>Fecha Presentación:</strong> {zone.presentation.date}</p>
          <p><strong>Horario:</strong> {zone.presentation.time.start} - {zone.presentation.time.end}</p>
          {zone.location.map((loc, index) => (
            <p key={index}>
              <strong>{loc.division}:</strong> Capacidad: {loc.space} | Disponible: {loc.space - loc.occupied} | <strong>Precio:</strong> ${loc.price}
            </p>
          ))}
          
          <h3 className="purchase-title">Comprar Entrada</h3>
          <div className="purchase-options">
            <label>División:</label>
            <select value={selectedDivision} onChange={handleDivisionChange} className="division-select">
              {zone?.location?.map((loc) => (
                <option key={loc.division} value={loc.division}>{loc.division}</option>
              ))}
            </select>
          </div>
          <p><strong>Precio:</strong> ${selectedPrice}</p>
          
          <button onClick={() => handleOpenBuyerModal(user?.cashier ? "sell" : "buy")} className="buy-button">
            {user?.cashier ? "Vender Entrada" : "Comprar con Mercado Pago"}
          </button>
        </div>
      )}
    </div>
  );
};

export default GeneralDetail;
