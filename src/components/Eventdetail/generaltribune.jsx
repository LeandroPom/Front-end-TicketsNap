import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import Swal from 'sweetalert2';
import axios from 'axios';


const Generaltribunes = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const {
    eventdetail,
    generalDivision,
    presentations,
    presentation,
    price = 0,
    date,
    time,
    zoneId,
    showId,
    space,
    occupied,
  } = location.state || {};
  const user = useSelector((state) => state.user);

  const [isLoading, setIsLoading] = useState(false);
  const [availableSpace, setAvailableSpace] = useState(0);
  const [selectedSpaces, setSelectedSpaces] = useState(1);
  const [inputValue, setInputValue] = useState("1");

  useEffect(() => {
    if (space && occupied !== undefined) {
      setAvailableSpace(space - occupied);
    }
  }, [space, occupied]);

  useEffect(() => {
    setInputValue(String(selectedSpaces));
  }, [selectedSpaces]);

  const numericInput = Number(inputValue);
  const validSpaces =
    !isNaN(numericInput) && numericInput >= 1
      ? Math.min(numericInput, availableSpace)
      : 0;
  const totalPrice = price * validSpaces;
  const recargo = totalPrice * 0.2;

  const handleOpenBuyerModal = (paymentMethod) => {
    const storedData =
      JSON.parse(sessionStorage.getItem("buyerData")) || {
        dni: "",
        firstName: "",
        lastName: "",
        email: "",
        phone: "",
      };
    const { dni, firstName, lastName, email, phone } = storedData;

    Swal.fire({
      title: "Debe cargar los datos del comprador",
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
        </div>
      `,
      focusConfirm: false,
      showCancelButton: true,
      showDenyButton: true,
      confirmButtonText: "Confirmar",
      cancelButtonText: "Borrar datos",
      denyButtonText: "Autocompletar",
      preConfirm: () => {
        const dni = document.getElementById("dni").value;
        const firstName = document.getElementById("firstName").value;
        const lastName = document.getElementById("lastName").value;
        const email = document.getElementById("email").value;
        const phone = document.getElementById("phone").value;

        if (!dni || !firstName || !lastName || !email || !phone) {
          Swal.showValidationMessage("Todos los campos son obligatorios");
          return null;
        }

        return { dni, firstName, lastName, email, phone };
      },
    }).then((result) => {
      if (result.isConfirmed) {
  sessionStorage.setItem("buyerData", JSON.stringify(result.value));
  setSelectedSpaces(validSpaces); // Asegurar valor actualizado
  
  if (paymentMethod === "buy") {
    Swal.fire({
      title: '⚠️ Atención',
      html: `
        Una vez que su pago con <strong>MercadoPago</strong> se procese correctamente,<br>
        <b>debe esperar</b> la redirección automática para que su ticket se genere sin errores.<br><br>
        <span style="color: red; font-weight: bold;">
          Si interrumpe el proceso o cierra la ventana, perderá su ticket.
        </span>
      `,
      icon: 'warning',
      confirmButtonText: 'Entendido, Continuar al pago'
    }).then((confirmResult) => {
      if (confirmResult.isConfirmed) {
        handleConfirmPurchase(result.value, paymentMethod);
      }
    });
  } else {
    handleConfirmPurchase(result.value, paymentMethod);
  }

} else if (result.isDenied) {
  const [firstName = "", lastName = ""] = (user?.name || "").split(" ");
  const autoData = {
    dni: "12345678",
    firstName,
    lastName,
    email: user?.email || "",
    phone: "123456789",
  };
  sessionStorage.setItem("buyerData", JSON.stringify(autoData));
  handleOpenBuyerModal(paymentMethod);

} else if (result.dismiss === Swal.DismissReason.cancel) {
  sessionStorage.removeItem("buyerData");
  Swal.fire({
    title: "Datos borrados",
    text: "Los datos se han borrado, puedes ingresar nuevos.",
    icon: "info",
    confirmButtonText: "Aceptar",
  }).then(() => {
    handleOpenBuyerModal(paymentMethod);
  });
}
    });
  };

  const handleConfirmPurchase = async (buyerDetails, paymentMethod) => {
    setIsLoading(true);

    const ticketsArray = Array.from({ length: selectedSpaces }, () => ({
      showId,
      zoneId,
      division: presentations,
      row: "",
      rows: "",
      rowPrice: "",
      seat: "",
      price,
      userId: user?.id,
      name: `${buyerDetails.firstName} ${buyerDetails.lastName}`,
      dni: buyerDetails.dni,
      mail: buyerDetails.email,
      phone: buyerDetails.phone,
    }));

    const serviceType = paymentMethod === "sell" ? "CASH" : "MP";

    try {
      const response = await axios.post("/tickets/sales", {
        tickets: ticketsArray,
        service: serviceType,
      });

      const ticketsResponse = response.data;

      sessionStorage.setItem(
        "ticketData",
        JSON.stringify({ tickets: ticketsResponse })
      );

      if (response.data.init_point && paymentMethod === "buy") {
        window.location.href = response.data.init_point;
        return;
      }

      Swal.fire({
        title: "Venta confirmada",
        text: "Se ha procesado correctamente.",
        icon: "success",
        confirmButtonText: "Aceptar",
      });

      navigate("/success", {
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
        title: "Error",
        text: "No se pudo completar la operación. Intenta nuevamente.",
        icon: "error",
        confirmButtonText: "Aceptar",
      });
    }

    setIsLoading(false);
  };

  if (isLoading) {
    return (
      <div className="loading-overlay">
        <div
          className="corner-img top-left"
          style={{ backgroundImage: "url(/images/solticket.png)" }}
        ></div>
        <div
          className="corner-img top-right"
          style={{ backgroundImage: "url(/images/solticket.png)" }}
        ></div>
        <div
          className="corner-img bottom-left"
          style={{ backgroundImage: "url(/images/solticket.png)" }}
        ></div>
        <div
          className="corner-img bottom-right"
          style={{ backgroundImage: "url(/images/solticket.png)" }}
        ></div>

        <div className="spinner"></div>
        <p>Procesando su compra...</p>
      </div>
    );
  }

  return (
  <div
    className="min-h-screen flex flex-col items-center justify-start px-4 py-8 pt-[160px]"
    style={{
      background: 'rgba(86, 86, 190, 0.4)',
      backdropFilter: 'blur(10px)',
      WebkitBackdropFilter: 'blur(10px)',
    }}
  >
    <h1 className="text-2xl md:text-3xl font-bold text-white mb-6 text-center">
      Tribunas Generales
    </h1>

    <div className="w-full max-w-lg bg-white/20 backdrop-blur-lg border border-white/30 rounded-2xl shadow-lg p-6 space-y-4 text-white">
      <h2 className="text-xl font-semibold">{presentations}</h2>
      <p>
        <strong>Descripción:</strong> {eventdetail?.name}
      </p>
      <p>
        <strong>Fecha:</strong> {date}
      </p>
      <p>
        <strong>Hora:</strong> {time?.start} - {time?.end}
      </p>
      <p>
        <strong>Precio:</strong> ${price}
      </p>
      <p className="text-red-400">
        <strong>Recargo de servicios:</strong> ${(price * 0.2).toFixed(2)}
      </p>

      {(user?.isAdmin || user?.cashier) && (
        <>
          <p>
            <strong>Espacios Disponibles:</strong> {availableSpace}
          </p>
          <p>
            <strong>Espacios Ocupados:</strong> {occupied}
          </p>
        </>
      )}

      {availableSpace > 0 && (
        <div className="mt-4 space-y-2">
          <label className="block">
            <strong>Cantidad de Entradas:</strong>
          </label>
          <input
            type="number"
            min="1"
            max={availableSpace}
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onBlur={() => {
              let value = Number(inputValue);
              if (isNaN(value) || value < 1) value = 1;
              if (value > availableSpace) value = availableSpace;
              setSelectedSpaces(value);
              setInputValue(String(value));
            }}
            className="w-full p-2 rounded-lg bg-white/30 text-white placeholder-gray-200 border border-white/40 focus:outline-none focus:ring-2 focus:ring-blue-300"
          />

          <p>
            <strong>Total:</strong> ${totalPrice.toFixed(2)}
          </p>
          <p className="text-red-400">
            <strong>Recargo de servicios:</strong> ${recargo.toFixed(2)}
          </p>
        </div>
      )}

      <div className="pt-4">
        {user?.cashier ? (
          <button
            onClick={() => handleOpenBuyerModal('sell')}
            className="py-2 px-4 bg-blue-500 hover:hover:bg-blue-600 text-white font-bold rounded-lg transition-colors duration-300"
          >
            Vender Entrada
          </button>
        ) : (
          <button
            onClick={() => handleOpenBuyerModal('buy')}
            className="py-2 px-4 bg-blue-500 hover:bg-blue-600 text-white font-bold rounded-lg transition-colors duration-300"
          >
            Comprar con Mercado Pago
          </button>
        )}
      </div>
    </div>
  </div>
);

};

export default Generaltribunes;
