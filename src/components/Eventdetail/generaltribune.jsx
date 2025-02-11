import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import Swal from 'sweetalert2';
import axios from 'axios';

const Generaltribunes = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { eventdetail, generalDivision, presentations, price = 0, date, time, zoneId, showId, space, occupied } = location.state || {};
  const user = useSelector((state) => state.user);

  const [availableSpace, setAvailableSpace] = useState(0);
  const [selectedSpaces, setSelectedSpaces] = useState(0);
  const [totalPrice, setTotalPrice] = useState(0);

  useEffect(() => {
    if (space && occupied !== undefined) {
      setAvailableSpace(space - occupied);
    }
  }, [space, occupied]);

  const handleSelectSpace = () => {
    if (availableSpace > 0) {
      setAvailableSpace(availableSpace - 1);
      setSelectedSpaces(selectedSpaces + 1);
      setTotalPrice(totalPrice + price);
    } else {
      alert("No quedan espacios disponibles.");
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
      zoneId,
      division: presentations,
      row: "",
      rows: "",
      rowPrice: "",
      seat: "",
      price,
      userId: user?.id,
      cashier: { user: user?.cashier },
      name: `${buyerDetails.firstName} ${buyerDetails.lastName}`,
      dni: buyerDetails.dni,
      mail: buyerDetails.email,
      phone: buyerDetails.phone,
    };

    try {
      if (paymentMethod === "sell") {
        const response = await axios.post('/tickets/sell', ticketData);
        setAvailableSpace((prev) => prev - selectedSpaces);
        Swal.fire({
          title: 'Compra finalizada con éxito',
          text: 'Tu ticket ha sido generado correctamente.',
          icon: 'success',
          confirmButtonText: 'Aceptar',
        }).then(() => {
          navigate('/success', { state: response.data });
        });
      } else if (paymentMethod === "buy") {
        const response = await axios.post('/tickets/buy', ticketData);
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

  return (
    <div style={{ textAlign: 'center', marginTop: '80px' }}>
      <h1>Tribunas Generales</h1>
      <div style={{ border: '1px solid black', padding: '20px', display: 'inline-block', textAlign: 'left' }}>
        <h2>{presentations}</h2>
        <p><strong>Descripción:</strong> {eventdetail?.name}</p>
        <p><strong>Fecha:</strong> {date}</p>
        <p><strong>Hora:</strong> {time?.start} - {time?.end}</p>
        <p><strong>Precio:</strong> ${price}</p>
        <p><strong>Espacios Disponibles:</strong> {availableSpace}</p>
        <p><strong>Espacios Ocupados:</strong> {occupied}</p>

        <button onClick={() => handleOpenBuyerModal("sell")} style={{ marginTop: '20px', padding: '10px 20px' }}>
          Vender Entrada
        </button>
        <button onClick={() => handleOpenBuyerModal("buy")} style={{ marginTop: '20px', padding: '10px 20px' }}>
          Comprar con Mercado Pago
        </button>
      </div>
    </div>
  );
}

export default Generaltribunes;
