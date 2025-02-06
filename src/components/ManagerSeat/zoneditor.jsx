import React, { useState } from "react";
import axios from "axios";

const ZoneEditor = ({ showId }) => {
  const [zoneData, setZoneData] = useState({
    zoneName: "",
    generalTicket: false,
    presentation: {
      date: "",
      time: {
        start: "",
        end: "",
      },
      performance: 0,
    },
    location: [], // Aquí almacenaremos las divisiones y precios por fila
  });
  const [successAlert, setSuccessAlert] = useState(false); // Para mostrar mensajes de éxito

  const handleInputChange = (field, value) => {
    setZoneData({ ...zoneData, [field]: value });
  };

  const handlePresentationChange = (field, value) => {
    setZoneData({
      ...zoneData,
      presentation: {
        ...zoneData.presentation,
        [field]: value,
      },
    });
  };

  const handlePresentationTimeChange = (field, value) => {
    setZoneData({
      ...zoneData,
      presentation: {
        ...zoneData.presentation,
        time: {
          ...zoneData.presentation.time,
          [field]: value,
        },
      },
    });
  };

  const handleLocationChange = (division, field, value) => {
    // Actualizamos los precios por fila para cada división
    setZoneData({
      ...zoneData,
      location: zoneData.location.map((loc) =>
        loc.division === division
          ? {
              ...loc,
              [field]: value,
            }
          : loc
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
              rows: loc.rows.map((r) =>
                r.row === row ? { ...r, rowPrice: value } : r
              ),
            }
          : loc
      ),
    });
  };

  const saveChanges = async () => {
    try {
      // Estructura de datos para enviar al backend
      const dataToSend = {
        showId: showId, // ID del show seleccionado
        zoneName: zoneData.zoneName, // Nombre de la zona
        updates: {
          generalTicket: zoneData.generalTicket, // Valor de generalTicket
          presentation: {
            date: zoneData.presentation.date, // Fecha de la presentación
            performance: zoneData.presentation.performance, // Número de presentaciones
            time: {
              start: zoneData.presentation.time.start, // Hora de inicio
              end: zoneData.presentation.time.end, // Hora de fin
            },
          },
          location: zoneData.location.map((division) => ({
            division: division.division, // Nombre de la división
            generalPrice: division.generalPrice, // Precio general de la división
            rows: division.rows.map((row) => ({
              row: row.row, // Número de la fila
              rowPrice: row.rowPrice, // Precio de la fila
            })),
          })),
        },
      };

      console.log("Datos a enviar al backend:", dataToSend);

      // Enviar los datos al backend para crear la nueva zona
      const response = await axios.post("/zones/add", dataToSend);

      if (response.status === 200) {
        setSuccessAlert(true); // Mostrar mensaje de éxito
        // Limpiar los campos después de guardar
        setZoneData({
          zoneName: "",
          generalTicket: false,
          presentation: {
            date: "",
            time: {
              start: "",
              end: "",
            },
            performance: 0,
          },
          // location: ["Floresta"],
        });
      } else {
        console.error("Error al guardar los datos de la zona");
      }
    } catch (error) {
      console.error("Error al guardar los datos de la zona:", error);
    }
  };

  return (
    <div>
      <h1>Editar Zona</h1>

      <label>
        Nombre de la Zona:
        <input
          type="text"
          value={zoneData.zoneName}
          onChange={(e) => handleInputChange("zoneName", e.target.value)}
        />
      </label>

      <label>
        Ticket General:
        <input
          type="checkbox"
          checked={zoneData.generalTicket}
          onChange={(e) => handleInputChange("generalTicket", e.target.checked)}
        />
      </label>

      <h3>Presentación</h3>
      <label>
        Fecha:
        <input
          type="date"
          value={zoneData.presentation.date}
          onChange={(e) => handlePresentationChange("date", e.target.value)}
        />
      </label>

      <label>
        Hora de Inicio:
        <input
          type="time"
          value={zoneData.presentation.time.start}
          onChange={(e) => handlePresentationTimeChange("start", e.target.value)}
        />
      </label>

      <label>
        Hora de Fin:
        <input
          type="time"
          value={zoneData.presentation.time.end}
          onChange={(e) => handlePresentationTimeChange("end", e.target.value)}
        />
      </label>

      <label>
        Performance:
        <input
          type="number"
          value={zoneData.presentation.performance}
          onChange={(e) => handlePresentationChange("performance", e.target.value)}
        />
      </label>

      {/* Aquí tendrías que agregar la lógica para manejar las divisiones y los precios */}
      {zoneData.location.map((division, index) => (
        <div key={index}>
          <h4>División {division.division}</h4>
          <label>
            Precio General:
            <input
              type="number"
              value={division.generalPrice}
              onChange={(e) => handleLocationChange(division.division, "generalPrice", e.target.value)}
            />
          </label>

          {division.rows.map((row, rowIndex) => (
            <div key={rowIndex}>
              <label>
                Fila {row.row} Precio por Fila:
                <input
                  type="number"
                  value={row.rowPrice}
                  onChange={(e) => handleRowPriceChange(division.division, row.row, e.target.value)}
                />
              </label>
            </div>
          ))}
        </div>
      ))}

      <button onClick={saveChanges}>Guardar Cambios</button>

      {successAlert && <p>Los datos de la zona se han guardado correctamente.</p>}
    </div>
  );
};

export default ZoneEditor;
