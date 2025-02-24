import React, { useState } from "react";
import axios from "axios";
import { useNavigate } from 'react-router-dom';
import Swal from 'sweetalert2';
import './ZoneEditor.css';

const initialLocations = [
  { division: "Vip", generalPrice: 0, rows: Array.from({ length: 10 }, (_, i) => ({ row: i + 1, rowPrice: 0 })) },
  { division: "Preferencial", generalPrice: 0, rows: Array.from({ length: 10 }, (_, i) => ({ row: i + 1, rowPrice: 0 })) },
  { division: "Gold", generalPrice: 0, rows: Array.from({ length: 10 }, (_, i) => ({ row: i + 1, rowPrice: 0 })) },
  { division: "Platea Sur", generalPrice: 0, rows: Array.from({ length: 5 }, (_, i) => ({ row: i + 1, rowPrice: 0 })) },
  { division: "Platea Norte", generalPrice: 0, rows: Array.from({ length: 5 }, (_, i) => ({ row: i + 1, rowPrice: 0 })) },
  { division: "Tribunas Generales", generalPrice: 0, rows: [] }, // Sin filas
];

const ZoneEditor = ({ showId }) => {
  const [zoneData, setZoneData] = useState({
    zoneName: "",
    generalTicket: false,
    presentation: { date: "", time: { start: "", end: "" }, performance: 0 },
    location: initialLocations,
  });

  const [selectedDivision, setSelectedDivision] = useState("Vip");
  const [selectedRow, setSelectedRow] = useState(1);
  const navigate = useNavigate();

  const handleInputChange = (field, value) => {
    setZoneData({ ...zoneData, [field]: value });
  };

  const handlePresentationChange = (field, value) => {
    setZoneData({
      ...zoneData,
      presentation: { ...zoneData.presentation, [field]: value },
    });
  };

  const handleTimeChange = (field, value) => {
    setZoneData({
      ...zoneData,
      presentation: {
        ...zoneData.presentation,
        time: { ...zoneData.presentation.time, [field]: value },
      },
    });
  };

  const handleLocationChange = (division, field, value) => {
    setZoneData({
      ...zoneData,
      location: zoneData.location.map((loc) =>
        loc.division === division ? { ...loc, [field]: Number(value) } : loc
      ),
    });
  };

  const handleRowPriceChange = (division, row, value) => {
    setZoneData({
      ...zoneData,
      location: zoneData.location.map((loc) =>
        loc.division === division
          ? {
              ...loc,
              rows: loc.rows.map((r) => (r.row === row ? { ...r, rowPrice: Number(value) } : r)),
            }
          : loc
      ),
    });
  };
  console.log(zoneData)
  const saveChanges = async () => {
    try {
      const dataToSend = {
        showId,
        zoneName: zoneData.zoneName,
        updates: {
          generalTicket: zoneData.generalTicket,
          presentation: zoneData.presentation,
          location: zoneData.location.map((division) => {
            if (zoneData.generalTicket) {
              // Si "generalTicket" está marcado, tomamos solo el precio general para todas las divisiones
              if (division.division === "Tribunas Generales") {
                // Tribunas Generales siempre toma el generalPrice
                return {
                  division: division.division,
                  generalPrice: division.generalPrice,
                  rows: [], // Sin filas
                };
              } else {
                // Para el resto de divisiones, no se deben tomar las filas
                return {
                  division: division.division,
                  generalPrice: division.generalPrice,
                  rows: [], // Sin filas
                };
              }
            } else {
              // Si "generalTicket" no está marcado, tomamos los precios por fila para divisiones con filas
              if (division.division === "Tribunas Generales") {
                // Tribunas Generales toma siempre el generalPrice
                return {
                  division: division.division,
                  generalPrice: division.generalPrice,
                  rows: [], // No tiene filas, pero se guarda el generalPrice
                };
              } else {
                // Para el resto de divisiones, tomamos los precios por fila
                return {
                  division: division.division,
                  generalPrice: division.generalPrice,
                  rows: division.rows, // Se guardan las filas con precios
                };
              }
            }
          }),
        },
      };
  
      console.log("Datos a enviar: ", dataToSend); // Verifica el objeto que estás enviando
  
      const response = await axios.post("/zones/add", dataToSend);
      if (response.status === 201) {
        Swal.fire({
          title: '¡Éxito!',
          text: 'Los datos se guardaron correctamente.',
          icon: 'success',
          confirmButtonText: 'Aceptar'
        });
        navigate("/")
      }
    } catch (error) {
      // Manejando el error
      console.error("Error al guardar:", error);
  
      // Si el error es un error de respuesta HTTP (error.response), muestra un SweetAlert
      if (error.response) {
        Swal.fire({
          title: '¡Error!',
          text: error.response.data.message || 'Verifique los datos de Performance, Data y Time',
          icon: 'error',
          confirmButtonText: 'Aceptar',
        });
      } else if (error.request) {
        // Si no se recibe respuesta del servidor
        Swal.fire({
          title: '¡Error!',
          text: 'No se recibió respuesta del servidor. Intente nuevamente.',
          icon: 'error',
          confirmButtonText: 'Aceptar',
        });
      } else {
        // Para otros tipos de error (como un error en la configuración de la solicitud)
        Swal.fire({
          title: '¡Error!',
          text: 'Ocurrió un error inesperado. Intente nuevamente.',
          icon: 'error',
          confirmButtonText: 'Aceptar',
        });
      }
    }

  };
  
  return (
    <div className="zone-editor-container">
      <h1>Agregar Data</h1>

      <label>
        Nombre de la Zona:
        <input type="text" value={zoneData.zoneName} onChange={(e) => handleInputChange("zoneName", e.target.value)} />
      </label>

      <label>
        Ticket General:
        <input type="checkbox" checked={zoneData.generalTicket} onChange={(e) => handleInputChange("generalTicket", e.target.checked)} />
      </label>

      <h3>Presentación</h3>
      <label>
        Fecha:
        <input type="date" value={zoneData.presentation.date} onChange={(e) => handlePresentationChange("date", e.target.value)} />
      </label>
      <label>
        Inicio:
        <input type="time" value={zoneData.presentation.time.start} onChange={(e) => handleTimeChange("start", e.target.value)} />
      </label>
      <label>
        Fin:
        <input type="time" value={zoneData.presentation.time.end} onChange={(e) => handleTimeChange("end", e.target.value)} />
      </label>
      <label>
        Performance:
        <input type="number" value={zoneData.presentation.performance} onChange={(e) => handlePresentationChange("performance", Number(e.target.value))} />
      </label>

      <h3>Divisiones</h3>
      {zoneData.location.map((division, index) => (
        <div key={index}>
          <h4>{division.division}</h4>
          <label>
            Precio General:
            <input type="number" value={division.generalPrice} onChange={(e) => handleLocationChange(division.division, "generalPrice", e.target.value)} />
          </label>
        </div>
      ))}

      {!zoneData.generalTicket && (
        <div>
          <h3>Editar Precios por Fila</h3>
          <label>
            División:
            <select value={selectedDivision} onChange={(e) => setSelectedDivision(e.target.value)}>
  {zoneData.location.map((division) => (
    <option key={division.division} value={division.division}>
      {division.division}
    </option>
  ))}
</select>
          </label>

          <label>
            Fila:
            <select value={selectedRow} onChange={(e) => setSelectedRow(Number(e.target.value))}>
              {zoneData.location.find(loc => loc.division === selectedDivision)?.rows.map((row) => (
                <option key={row.row} value={row.row}>
                  {row.row}
                </option>
              ))}
            </select>
          </label>

          <label>
            Precio:
            <input
              type="number"
              value={
                zoneData.location
                  .find(loc => loc.division === selectedDivision)
                  ?.rows.find(r => r.row === selectedRow)?.rowPrice || 0
              }
              onChange={(e) => handleRowPriceChange(selectedDivision, selectedRow, e.target.value)}
            />
          </label>
        </div>
      )}

      <button onClick={saveChanges}>Guardar Cambios</button>
    </div>
  );
};

export default ZoneEditor;
