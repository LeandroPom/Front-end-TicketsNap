import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Swal from 'sweetalert2';
import axios from 'axios';
import { useSelector } from 'react-redux';
import './generaldetail.css';

const GeneralDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const showId = Number(id);

  // Estados
  const [show, setShow] = useState(null);
  const [zones, setZones] = useState([]);  // Lista de zonas
  const [loading, setLoading] = useState(true);
  const [isLoading, setIsLoading] = useState(false);  // Nuevo estado para cargar
  const [selectedZoneIndex, setSelectedZoneIndex] = useState(0);  // Índice de zona seleccionada
  const [selectedDivision, setSelectedDivision] = useState('');  // División seleccionada
  const [selectedPrice, setSelectedPrice] = useState(0);  // Precio de la división seleccionada
  const user = useSelector((state) => state.user);

  useEffect(() => {
    const fetchShowAndZones = async () => {
      setLoading(true);
      setZones([]);

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

        // Filtrar las zonas asociadas al showId
        const filteredZones = generalZones.filter((z) => z.showId === showId);

        if (filteredZones.length > 0) {
          setZones(filteredZones);
          // Inicializar la zona seleccionada y la división por defecto
          setSelectedZoneIndex(0);
          setSelectedDivision(filteredZones[0].location[0].division);
          setSelectedPrice(filteredZones[0].location[0].price);
        } else {
          Swal.fire({ title: 'No hay zonas para este show', text: 'Debes agregar una zona', icon: 'warning' })
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

  const handleZoneChange = (e) => {
    const selectedIndex = e.target.value;
    setSelectedZoneIndex(selectedIndex);
    setSelectedDivision(zones[selectedIndex].location[0].division);
    setSelectedPrice(zones[selectedIndex].location[0].price);
  };

  const handleDivisionChange = (e) => {
    const divisionName = e.target.value;
    setSelectedDivision(divisionName);

    const selectedLoc = zones[selectedZoneIndex].location.find((loc) => loc.division === divisionName);
    if (selectedLoc) {
      setSelectedPrice(selectedLoc.price);
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
      zoneId: zones[selectedZoneIndex].id,
      division: selectedDivision,
      price: selectedPrice,
      userId: user?.id,
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

  if (loading) {
    return <p>Cargando...</p>;
  }

  if (!show) return <p>No se encontró información del show.</p>;

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
      
      <div className="zone-selection">
  <label>Selecciona una presentación:</label>
  <select value={selectedZoneIndex} onChange={handleZoneChange} className="zone-select">
    {zones.map((zone, index) => (
      <option key={zone.id} value={index}>
        {zone.presentation.date} | {zone.presentation.time.start} - {zone.presentation.time.end}
      </option>
    ))}
  </select>
</div>
      
      {zones[selectedZoneIndex] && (
        <div className="zone-info">
          <h3 className="zone-title">Información de la Zona</h3>
          <p><strong>Fecha Presentación:</strong> {zones[selectedZoneIndex].presentation.date}</p>
          <p><strong>Horario:</strong> {zones[selectedZoneIndex].presentation.time.start} - {zones[selectedZoneIndex].presentation.time.end}</p>
          
          {zones[selectedZoneIndex].location.map((loc, index) => (
            <div key={index}>
              <p><strong>{loc.division}:</strong> 
                { (user?.isAdmin || user?.cashier) && (
                  <>Capacidad: {loc.space} | Disponible: {loc.space - loc.occupied} | </>
                )}
                <strong>Precio:</strong> ${loc.price}
              </p>
            </div>
          ))}
          
          <h3 className="purchase-title">Comprar Entrada</h3>
          <div className="purchase-options">
            <label>División:</label>
            <select value={selectedDivision} onChange={handleDivisionChange} className="division-select">
              {zones[selectedZoneIndex].location.map((loc) => (
                <option key={loc.division} value={loc.division}>{loc.division}</option>
              ))}
            </select>
          </div>
          <p><strong>Precio:</strong> ${selectedPrice}</p>
          <p style={{ color: "red" }}>
            <strong>Recargo de servicios:</strong> ${((selectedPrice * 0.20).toFixed(2))}
          </p>
          
          <button onClick={() => handleOpenBuyerModal(user?.cashier ? "sell" : "buy")} className="buy-button">
            {user?.cashier ? "Vender Entrada" : "Comprar con Mercado Pago"}
          </button>
        </div>
      )}
    </div>
  );
};

export default GeneralDetail;
