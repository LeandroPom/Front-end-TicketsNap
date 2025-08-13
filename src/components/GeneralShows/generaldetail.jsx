import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Swal from 'sweetalert2';
import axios from 'axios';
import { useSelector } from 'react-redux';

const GeneralDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const showId = Number(id);

  const [show, setShow] = useState(null);
  const [zones, setZones] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedZoneIndex, setSelectedZoneIndex] = useState(0);
  const [selectedDivision, setSelectedDivision] = useState('');
  const [selectedPrice, setSelectedPrice] = useState(0);
  const user = useSelector((state) => state.user);
  const [quantity, setQuantity] = useState(1);
  const validQuantity = Number(quantity) >= 1 ? Number(quantity) : 1;

  const getAvailableTickets = () => {
  const loc = zones[selectedZoneIndex].location.find((l) => l.division === selectedDivision);
  return loc ? loc.space - loc.occupied : 1;
};


  useEffect(() => {
    const fetchShowAndZones = async () => {
      setLoading(true);
      setZones([]);

      try {
        const showsResponse = await axios.get('/shows');
        const foundShow = showsResponse.data.find((s) => s.id === showId);

        if (!foundShow) {
          Swal.fire({ title: 'Error', text: 'No se encontró el show', icon: 'error' }).then(() => navigate('/'));
          return;
        }

        setShow(foundShow);

        const response = await axios.get('/zones/general');
        const generalZones = response.data.generalZones || [];

        const filteredZones = generalZones.filter((z) => z.showId === showId);

        if (filteredZones.length > 0) {
          setZones(filteredZones);
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
  const storedData = JSON.parse(sessionStorage.getItem('buyerData')) || {
    dni: '', firstName: '', lastName: '', email: '', phone: ''
  };

  const { dni, firstName, lastName, email, phone } = storedData;

  Swal.fire({
    title: 'Debe cargar los datos del comprador',
    html: `
      <div style="padding: 24px; max-width: 400px; margin: auto; background-color: #2a378fff; border-radius: 10px; font-family: 'Inter', sans-serif;">
        <label style="display: block; font-weight: bold; color: white; margin-bottom: 8px;">DNI:</label>
        <input type="text" id="dni" value="${dni || ''}" style="width: 100%; padding: 10px; margin-bottom: 16px;" />
        <label style="display: block; font-weight: bold; color: white; margin-bottom: 8px;">Nombre:</label>
        <input type="text" id="firstName" value="${firstName || ''}" style="width: 100%; padding: 10px; margin-bottom: 16px;" />
        <label style="display: block; font-weight: bold; color: white; margin-bottom: 8px;">Apellido:</label>
        <input type="text" id="lastName" value="${lastName || ''}" style="width: 100%; padding: 10px; margin-bottom: 16px;" />
        <label style="display: block; font-weight: bold; color: white; margin-bottom: 8px;">Correo:</label>
        <input type="email" id="email" value="${email || ''}" style="width: 100%; padding: 10px; margin-bottom: 16px;" />
        <label style="display: block; font-weight: bold; color: white; margin-bottom: 8px;">Teléfono:</label>
        <input type="text" id="phone" value="${phone || ''}" style="width: 100%; padding: 10px;" />
        <button id="autoFillBtn" style="margin-top: 16px; background-color: #3949ab; color: white; padding: 10px 16px; border: none; border-radius: 5px; cursor: pointer;">
          Autocompletar con mis datos
        </button>
      </div>
    `,
    focusConfirm: false,
    showCancelButton: true,
    confirmButtonText: 'Confirmar',
    cancelButtonText: 'Borrar datos',
    didOpen: () => {
      document.getElementById('autoFillBtn').addEventListener('click', () => {
        const [first = '', last = ''] = (user?.name || '').split(' ');
        document.getElementById('firstName').value = first;
        document.getElementById('lastName').value = last;
        document.getElementById('email').value = user?.email || '';
        document.getElementById('dni').value = '';
        document.getElementById('phone').value = '';
      });
    },
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
      sessionStorage.setItem('buyerData', JSON.stringify(result.value));
      handleConfirmPurchase(result.value, paymentMethod);
    } else if (result.dismiss === Swal.DismissReason.cancel) {
      sessionStorage.removeItem('buyerData');
      Swal.fire({
        title: 'Datos borrados',
        text: 'Los datos se han borrado, puedes ingresar nuevos.',
        icon: 'info',
        confirmButtonText: 'Aceptar',
      }).then(() => handleOpenBuyerModal(paymentMethod));
    }
  });
};



  const handleConfirmPurchase = async (buyerDetails, paymentMethod) => {
  setIsLoading(true);

  const zone = zones[selectedZoneIndex];
  const selectedLoc = zone.location.find((loc) => loc.division === selectedDivision);

  // Generar un array de tickets (uno por cada entrada)
  const ticketsPayload = Array.from({ length: quantity }, () => ({
    showId,
    zoneId: zone.id,
    division: selectedDivision,
    price: selectedPrice,
    userId: user?.id,
    name: `${buyerDetails.firstName} ${buyerDetails.lastName}`,
    dni: buyerDetails.dni,
    mail: buyerDetails.email,
    phone: buyerDetails.phone,
  }));

  const serviceType = paymentMethod === "sell" ? "CASH" : "MP";

  console.log(ticketsPayload, " datos q mando al back")

  try {
    const response = await axios.post('/tickets/sales', {
      tickets: ticketsPayload,
      service: serviceType,
    });

    console.log(serviceType, " datos q mando al back")

    const ticketsResponse = response.data;

    sessionStorage.setItem("ticketData", JSON.stringify({ tickets: ticketsResponse }));

    if (response.data.init_point && paymentMethod === "buy") {
      window.location.href = response.data.init_point;
      return;
    }

    Swal.fire({
      title: 'Venta confirmada',
      text: 'Se ha procesado correctamente.',
      icon: 'success',
      confirmButtonText: 'Aceptar',
    });

    navigate('/success', {
      state: {
        tickets: ticketsResponse,
        mail: buyerDetails.email,
        name: `${buyerDetails.firstName} ${buyerDetails.lastName}`,
        phone: buyerDetails.phone,
      },
    });

  } catch (error) {
    console.error("Error al confirmar la compra:", error);
    Swal.fire({
      title: 'Error',
      text: 'No se pudo completar la operación. Intenta nuevamente.',
      icon: 'error',
      confirmButtonText: 'Aceptar',
    });
  }

  setIsLoading(false);
};

  if (loading) return <p className="text-white text-center mt-10">Cargando...</p>;

  if (isLoading) {
    return (
      <div className="fixed inset-0 flex items-center justify-center bg-[#757272] z-50 text-white text-lg flex-col">
        {/* Esquinas decorativas */}
        <div className="absolute top-2 left-2 w-24 h-24 bg-no-repeat bg-contain" style={{ backgroundImage: 'url(/images/solticket.png)' }}></div>
        <div className="absolute top-2 right-2 w-24 h-24 bg-no-repeat bg-contain" style={{ backgroundImage: 'url(/images/solticket.png)' }}></div>
        <div className="absolute bottom-2 left-2 w-24 h-24 bg-no-repeat bg-contain" style={{ backgroundImage: 'url(/images/solticket.png)' }}></div>
        <div className="absolute bottom-2 right-2 w-24 h-24 bg-no-repeat bg-contain" style={{ backgroundImage: 'url(/images/solticket.png)' }}></div>

        {/* Spinner */}
        <div className="w-12 h-12 border-4 border-[#FFD166] border-t-[#f3f725] rounded-full animate-spin"></div>
        <p className="mt-4">Procesando su compra...</p>
      </div>
    );
  }

  return (
  <div className="max-w-4xl mx-auto mt-28 p-6 bg-[rgb(50,50,109)] text-white rounded-lg shadow-md">
    <h1 className="text-2xl font-bold mb-4">{show.name}</h1>
    <img src={show.coverImage} alt={show.name} className="w-full rounded-lg mb-4" />

    <p><span className="font-bold text-white">Género:</span > {show.genre.join(', ')}</p >
    <p><span className="font-bold text-white">Artistas:</span> {show.artists.join(', ')}</p>
    <p><span className="font-bold text-white">Descripción:</span> {show.description}</p>
    <p><span className="font-bold text-white">Ubicación:</span> {show.location}</p>

    {/* Select zona */}
    <div className="mt-4">
      <label className="font-bold text-white">Selecciona una presentación:</label>
      <select
        value={selectedZoneIndex}
        onChange={handleZoneChange}
        className="w-full mt-1 p-2 rounded bg-[rgb(70,70,140)] text-white border border-white"
      >
        {zones.map((zone, index) => (
          <option key={zone.id} value={index}>
            {zone.presentation.date} | {zone.presentation.time.start} - {zone.presentation.time.end}
          </option>
        ))}
      </select>
    </div>

    {/* Info zona */}
    {zones[selectedZoneIndex] && (
      <div className="mt-6 p-4 bg-[rgb(70,70,140)] rounded-lg">
        <h3 className="text-lg font-bold text-white mb-2">Información de la Zona</h3>
        <p><span className="font-semibold text-white">Fecha:</span> {zones[selectedZoneIndex].presentation.date}</p>
        <p><span className="font-semibold text-white">Horario:</span> {zones[selectedZoneIndex].presentation.time.start} - {zones[selectedZoneIndex].presentation.time.end}</p>

        {zones[selectedZoneIndex].location.map((loc, index) => (
          <div key={index}>
            <p>
              <span className="font-semibold text-white">{loc.division}:</span>
              {(user?.isAdmin || user?.cashier) && (
                <> Capacidad: {loc.space} | Disponible: {loc.space - loc.occupied} | </>
              )}
              <span className="font-semibold text-white">Precio:</span> ${loc.price}
            </p>
          </div>
        ))}

        {/* Select división */}
        <div className="mt-4">
          <label className="block font-bold text-white">División:</label>
          <select
            value={selectedDivision}
            onChange={handleDivisionChange}
            className="w-full mt-1 p-2 rounded bg-[rgb(90,90,170)] text-white border border-white"
          >
            {zones[selectedZoneIndex].location.map((loc) => (
              <option key={loc.division} value={loc.division}>{loc.division}</option>
            ))}
          </select>
        </div>

        <div className="mt-4">
  <label className="block font-bold text-white">Cantidad de Entradas:</label>
 <input
  type="number"
  min="1"
  max={getAvailableTickets()}
  value={quantity}
  onChange={(e) => {
    const value = e.target.value;
    if (value === '') {
      setQuantity(''); // Permitimos el campo vacío para que el usuario pueda borrar
    } else {
      const parsed = parseInt(value, 10);
      if (!isNaN(parsed) && parsed >= 1) {
        setQuantity(parsed);
      }
    }
  }}
  className="w-full mt-1 p-2 rounded bg-[rgb(90,90,170)] text-white border border-white"
/>
</div>

        <p className="mt-2"><span className="font-semibold text-white">Precio:</span> ${selectedPrice}</p>
        {/* <p className="text-red-400"><span className="font-semibold text-red">Recargo de servicios:</span> ${(selectedPrice * 0.2).toFixed(2)}</p> */}
<p className="mt-2">
 <span className="font-semibold text-white">Valor Total:</span> ${selectedPrice * validQuantity}
</p>
<p className="text-red-400">
  <span className="font-semibold text-red">Recargo de servicios:</span> ${(selectedPrice * validQuantity * 0.2).toFixed(2)}
</p>
        <button
          onClick={() => handleOpenBuyerModal(user?.cashier ? "sell" : "buy")}
          className="mt-4 bg-[rgb(90,90,170)] text-white font-bold py-2 px-6 rounded hover:bg-[rgb(110,110,190)] transition mx-auto block"
        >
          {user?.cashier ? "Vender Entrada" : "Comprar con Mercado Pago"}
        </button>
      </div>
    )}
  </div>
);


};

export default GeneralDetail;
